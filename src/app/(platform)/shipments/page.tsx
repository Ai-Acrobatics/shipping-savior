import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'Shipments | Shipping Savior' };

export default function ShipmentsPage() {
  return (
    <ComingSoonShell
      title="Shipment Manager"
      description="Track and manage all shipments from booking to delivery."
      iconName="Ship"
      features={[
        'Real-time shipment tracking with map visualization',
        'Container and cargo management',
        'Document workflow (BOL, ISF, commercial invoice)',
        'Timeline and milestone tracking',
        'Carrier performance analytics',
      ]}
    />
  );
}
