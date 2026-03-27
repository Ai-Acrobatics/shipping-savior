import { db } from '@/lib/db';
import { auditLogs, type AuditAction } from '@/lib/db/schema';

export async function writeAuditLog(params: {
  userId?: string;
  orgId?: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      orgId: params.orgId ?? null,
      action: params.action,
      metadata: params.metadata ?? {},
      ipAddress: params.ipAddress ?? null,
    });
  } catch (error) {
    // Fire-and-forget: audit failures must never block auth flow
    console.error('[audit] Failed to write audit log:', error);
  }
}
