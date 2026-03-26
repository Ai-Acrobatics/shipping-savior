import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Calculators | Shipping Savior' };

export default function CalculatorsPage() {
  return (
    <ComingSoonShell
      title="Calculator Hub"
      description="Precision tools for every cost calculation in your supply chain."
      iconName="Calculator"
      features={[
        'Landed cost calculator with real-time tariff data',
        'Duty & tariff estimator by HTS code',
        'Container utilization optimizer',
        'Freight rate comparator across carriers',
        'FTZ savings scenario builder',
        'Route cost comparison tool',
      ]}
    />
  );
}
