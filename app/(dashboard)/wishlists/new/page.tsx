import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function NewWishlistPage() {
  return (
    <main className="app-shell">
      <DashboardHeader title="New wishlist" eyebrow="Owner view" />
      <section className="empty-panel">
        <h2>Create wishlist form goes here.</h2>
        <p>Next step: wire this to Supabase using `actions/wishlist.actions.ts`.</p>
      </section>
    </main>
  );
}
