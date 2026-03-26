/**
 * Benchmark 06: Real-time WebSocket Solutions for Live Tracking
 * Tests local WebSocket throughput and evaluates managed services
 */

import { WebSocketServer, WebSocket } from 'ws';
import { writeFileSync } from 'fs';

// Simulate vessel position updates (what live tracking would look like)
function generateVesselUpdate(id) {
  return JSON.stringify({
    type: 'vessel_position',
    vesselId: `IMO-${9000000 + id}`,
    vesselName: `VESSEL_${id}`,
    position: {
      lat: 10 + Math.random() * 30, // SE Asia to US corridor
      lon: 100 + Math.random() * 80,
    },
    speed: 12 + Math.random() * 8, // knots
    heading: Math.random() * 360,
    status: ['underway', 'at_anchor', 'moored'][Math.floor(Math.random() * 3)],
    eta: new Date(Date.now() + Math.random() * 30 * 86400000).toISOString(),
    timestamp: new Date().toISOString(),
  });
}

// Simulate container status update
function generateContainerUpdate(id) {
  return JSON.stringify({
    type: 'container_status',
    containerId: `CSLU-${4000000 + id}`,
    blNumber: `BL-2026-${String(id).padStart(4, '0')}`,
    status: ['in_transit', 'at_port', 'customs_hold', 'in_ftz', 'delivered'][Math.floor(Math.random() * 5)],
    location: {
      port: ['Cat Lai', 'Laem Chabang', 'Singapore', 'Los Angeles', 'Long Beach'][Math.floor(Math.random() * 5)],
      terminal: `Terminal ${Math.floor(Math.random() * 5) + 1}`,
    },
    temperature: -18 + Math.random() * 2, // For reefer containers
    timestamp: new Date().toISOString(),
  });
}

console.log('=== BENCHMARK: WebSocket Solutions for Live Tracking ===\n');

// Test 1: Local WebSocket throughput
console.log('--- Test 1: WebSocket Message Throughput ---\n');

const PORT = 9876 + Math.floor(Math.random() * 1000);

await new Promise((resolve) => {
  const wss = new WebSocketServer({ port: PORT });
  let messagesReceived = 0;
  let bytesReceived = 0;
  const startTime = performance.now();

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      messagesReceived++;
      bytesReceived += data.length;
    });
  });

  wss.on('listening', () => {
    const client = new WebSocket(`ws://localhost:${PORT}`);

    client.on('open', () => {
      // Send 10,000 vessel updates as fast as possible
      const totalMessages = 10000;
      const batchStart = performance.now();

      for (let i = 0; i < totalMessages; i++) {
        const msg = i % 2 === 0 ? generateVesselUpdate(i) : generateContainerUpdate(i);
        client.send(msg);
      }

      // Wait for all messages to arrive
      const checkInterval = setInterval(() => {
        if (messagesReceived >= totalMessages) {
          clearInterval(checkInterval);
          const elapsed = performance.now() - batchStart;

          console.log(`Messages sent: ${totalMessages}`);
          console.log(`Messages received: ${messagesReceived}`);
          console.log(`Total time: ${elapsed.toFixed(0)}ms`);
          console.log(`Throughput: ${Math.round(totalMessages / (elapsed / 1000)).toLocaleString()} msg/sec`);
          console.log(`Data transferred: ${(bytesReceived / 1024).toFixed(1)} KB`);
          console.log(`Avg message size: ${Math.round(bytesReceived / totalMessages)} bytes`);
          console.log(`Avg latency: ${(elapsed / totalMessages).toFixed(3)}ms/msg`);

          // Cleanup
          client.close();
          wss.close(() => resolve({
            messagesReceived,
            throughputPerSec: Math.round(totalMessages / (elapsed / 1000)),
            avgLatencyMs: parseFloat((elapsed / totalMessages).toFixed(3)),
            totalBytes: bytesReceived,
          }));
        }
      }, 50);
    });
  });
});

// Test 2: Concurrent connections simulation
console.log('\n--- Test 2: Concurrent Connection Capacity ---\n');

const PORT2 = PORT + 1;
const connectionResults = await new Promise((resolve) => {
  const wss = new WebSocketServer({ port: PORT2 });
  const clients = [];
  const targetConnections = 200;
  let connectedCount = 0;

  wss.on('listening', () => {
    const connectStart = performance.now();

    for (let i = 0; i < targetConnections; i++) {
      const client = new WebSocket(`ws://localhost:${PORT2}`);
      client.on('open', () => {
        connectedCount++;
        if (connectedCount === targetConnections) {
          const connectTime = performance.now() - connectStart;
          console.log(`${targetConnections} concurrent connections established in ${connectTime.toFixed(0)}ms`);
          console.log(`Avg connection time: ${(connectTime / targetConnections).toFixed(1)}ms`);

          // Broadcast a message to all
          const broadcastStart = performance.now();
          const broadcastMsg = generateVesselUpdate(999);
          let received = 0;

          for (const c of wss.clients) {
            c.send(broadcastMsg);
          }

          wss.clients.forEach((c) => {
            c.on('message', () => { received++; });
          });

          // Short delay then cleanup
          setTimeout(() => {
            const broadcastTime = performance.now() - broadcastStart;
            console.log(`Broadcast to ${targetConnections} clients: ${broadcastTime.toFixed(0)}ms`);

            // Cleanup
            clients.forEach(c => c.close());
            wss.close(() => resolve({
              connections: targetConnections,
              connectTimeMs: parseFloat(connectTime.toFixed(0)),
              avgConnectMs: parseFloat((connectTime / targetConnections).toFixed(1)),
              broadcastMs: parseFloat(broadcastTime.toFixed(0)),
            }));
          }, 200);
        }
      });
      clients.push(client);
    }
  });
});

// Managed service comparison
console.log('\n=== MANAGED WEBSOCKET SERVICE COMPARISON ===\n');
console.log('| Service            | Connections  | Messages/sec  | Pricing              | Shipping Use  |');
console.log('|--------------------|-------------|---------------|----------------------|---------------|');
console.log('| Pusher             | 100-500K    | 200-1M/day    | Free: 200K msg/day   | Good          |');
console.log('| Ably               | Unlimited   | Unlimited     | Free: 6M msg/month   | Excellent     |');
console.log('| Socket.io (self)   | OS-limited  | Hardware-dep  | Server cost only     | Good          |');
console.log('| Supabase Realtime  | 200 (free)  | Unlimited     | Free: 200 connections| Limited       |');
console.log('| Liveblocks         | 20 (free)   | Unlimited     | Free: 20 connections | Overkill      |');
console.log('| PartyKit (CF)      | 32K/room    | Unlimited     | Free: limited compute| Good          |');
console.log('| SSE (no WebSocket) | No limit    | Server push   | Free (HTTP)          | Sufficient    |');
console.log('');

console.log('=== SHIPPING-SPECIFIC ANALYSIS ===\n');
console.log('Live tracking update patterns:');
console.log('  - Vessel AIS updates: every 3-6 minutes at sea, every 10s in port');
console.log('  - Container status: event-driven (state changes), ~2-5 updates/day per container');
console.log('  - Temperature (reefer): every 15 minutes');
console.log('');
console.log('Scale estimate (Phase 2-3):');
console.log('  - 50-200 active containers tracked simultaneously');
console.log('  - 10-50 concurrent dashboard users');
console.log('  - ~5,000-20,000 messages/day');
console.log('');
console.log('Recommendation: Server-Sent Events (SSE) for Phase 1-2, WebSocket (Ably) for Phase 3');
console.log('');
console.log('Why SSE first:');
console.log('  1. Tracking is unidirectional (server → client)');
console.log('  2. Works with Next.js API routes (no special infra)');
console.log('  3. Auto-reconnect built into EventSource API');
console.log('  4. Much simpler than WebSocket for this use case');
console.log('  5. Vercel supports streaming responses');
console.log('');
console.log('When to upgrade to WebSocket:');
console.log('  - Bidirectional needs (user annotations on shipments)');
console.log('  - >100 concurrent users');
console.log('  - Real-time collaboration features');

const output = {
  benchmark: 'websocket-solutions',
  timestamp: new Date().toISOString(),
  localBenchmark: {
    throughput: {
      messages: 10000,
      note: 'See console output for detailed results',
    },
    concurrency: connectionResults,
  },
  services: {
    pusher: { freeMessages: '200K/day', freeConnections: 100, pricing: '$49-499/mo', best: 'simple pub/sub' },
    ably: { freeMessages: '6M/month', freeConnections: 200, pricing: '$29-399/mo', best: 'global distribution' },
    supabaseRealtime: { freeConnections: 200, pricing: 'included in Supabase plan', best: 'Postgres changes' },
    partyKit: { freeCompute: 'limited', pricing: 'CF Workers pricing', best: 'stateful collaboration' },
    sse: { cost: 'free', infra: 'Next.js API routes', best: 'unidirectional updates' },
  },
  shippingAnalysis: {
    updateFrequency: { vessel: '3-6 min at sea', container: '2-5/day', reefer: '15 min' },
    scaleEstimate: { containers: '50-200', users: '10-50', messagesPerDay: '5K-20K' },
  },
  recommendation: {
    phase1: 'SSE via Next.js API routes (polling fallback)',
    phase2: 'SSE with Vercel streaming',
    phase3: 'Ably or Pusher for bidirectional + scale',
    rationale: 'Tracking is unidirectional. SSE is simpler, cheaper, and sufficient for 50-200 containers.',
  },
};

writeFileSync('benchmarks/results/06-websocket.json', JSON.stringify(output, null, 2));
console.log('\nResults written to benchmarks/results/06-websocket.json');
