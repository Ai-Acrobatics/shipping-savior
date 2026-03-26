import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Compliance | Shipping Savior' };

export default function CompliancePage() {
  return (
    <ComingSoonShell
      title="Compliance Center"
      description="Stay ahead of regulatory changes and avoid costly penalties."
      iconName="ShieldCheck"
      features={[
        'Real-time tariff change alerts',
        'Compliance audit trail',
        'Denied party screening integration',
        'Regulatory calendar with deadlines',
        'Automated risk scoring per shipment',
      ]}
    />
  );
}
