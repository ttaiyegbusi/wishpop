import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardPage() {
  return (
    <main className="app-shell">
      <DashboardHeader title="Dashboard" eyebrow="WishPop" />
      <section className="panel-grid">
        <article className="empty-panel">
          <h2>No wishlists yet</h2>
          <p>Create your first wishlist, add items, then share one link.</p>
        </article>
      </section>
    </main>
  );
}
