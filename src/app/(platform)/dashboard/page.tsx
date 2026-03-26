import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Dashboard | Shipping Savior' };

export default function DashboardPage() {
  return (
    <ComingSoonShell
      title="Executive Dashboard"
      description="Your real-time command center for logistics operations."
      iconName="LayoutDashboard"
      features={[
        'Live shipment tracking and status overview',
        'Duty spend analytics with trend charts',
        'Compliance alert summary',
        'Cost savings tracker across FTZ and route optimizations',
        'AI-powered anomaly detection',
      ]}
    />
  );
}
