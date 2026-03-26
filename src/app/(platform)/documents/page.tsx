import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Documents | Shipping Savior' };

export default function DocumentsPage() {
  return (
    <ComingSoonShell
      title="Document Center"
      description="Centralized document management for all trade paperwork."
      iconName="FileText"
      features={[
        'Bill of Lading management',
        'ISF filing workflow',
        'Commercial invoice generation',
        'Packing list templates',
        'Document status tracking and approvals',
      ]}
    />
  );
}
