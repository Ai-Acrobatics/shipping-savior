import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Routes | Shipping Savior' };

export default function RoutesPage() {
  return (
    <ComingSoonShell
      title="Route Comparison"
      description="Compare shipping routes, carriers, and transit times side by side."
      iconName="Route"
      features={[
        'Multi-carrier route comparison',
        'Transit time vs. cost analysis',
        'Port congestion indicators',
        'Backhaul opportunity detection',
        'Transshipment route optimization',
      ]}
    />
  );
}
