export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">WishPop</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="auth-content">{children}</div>
      </section>
    </main>
  );
}
