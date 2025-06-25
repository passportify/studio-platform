export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh w-full flex flex-col items-center justify-center bg-muted p-4">
      {children}
    </div>
  );
}
