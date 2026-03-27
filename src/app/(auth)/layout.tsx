export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Shipping Savior</h1>
          <p className="text-navy-500 mt-1">International Logistics Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
