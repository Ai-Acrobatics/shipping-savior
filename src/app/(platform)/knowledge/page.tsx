import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Knowledge Base | Shipping Savior' };

export default function KnowledgePage() {
  return (
    <ComingSoonShell
      title="Knowledge Base"
      description="Searchable library of trade regulations, procedures, and best practices."
      iconName="BookOpen"
      features={[
        'HTS code reference with chapter breakdowns',
        'Trade agreement summaries (USMCA, GSP, etc.)',
        'Port guides and facility directories',
        'FTZ regulations and procedures',
        'Industry glossary and terminology',
      ]}
    />
  );
}
