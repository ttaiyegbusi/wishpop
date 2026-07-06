export function DashboardHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <header className="dashboard-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
    </header>
  );
}
