import ComingSoonShell from '@/components/platform/ComingSoonShell';

export const metadata = { title: 'AI Agents | Shipping Savior' };

export default function AIPage() {
  return (
    <ComingSoonShell
      title="AI Agents Hub"
      description="Intelligent automation for classification, compliance, and analysis."
      iconName="Bot"
      features={[
        'AI-powered HTS code classification',
        'Natural language tariff Q&A',
        'Automated compliance checking',
        'Smart document extraction',
        'Predictive analytics for duty rate changes',
      ]}
    />
  );
}
