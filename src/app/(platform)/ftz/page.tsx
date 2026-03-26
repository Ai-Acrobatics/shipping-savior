import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'FTZ Analyzer | Shipping Savior' };

export default function FTZPage() {
  return (
    <ComingSoonShell
      title="FTZ Analyzer"
      description="Maximize Foreign Trade Zone savings with data-driven decisions."
      iconName="Warehouse"
      features={[
        'FTZ zone lookup with proximity search',
        'Privileged vs. Non-Privileged Foreign status modeling',
        'Duty deferral savings calculator',
        'Entry and withdrawal tracking',
        'Cumulative savings dashboard',
      ]}
    />
  );
}
