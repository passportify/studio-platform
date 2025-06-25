import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Digital Product Passport',
    template: '%s | Digital Product Passport',
  },
  description: 'View product information and compliance data.',
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <div className="bg-muted min-h-svh font-body antialiased">
        {children}
     </div>
  );
}
