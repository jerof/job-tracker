import '../styles/landing.css';

export const metadata = {
  title: 'JobTracker - Land Your Next Job, Faster',
  description: 'Automatically track applications, generate tailored CVs, and research companies - all from one dashboard.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {children}
    </div>
  );
}
