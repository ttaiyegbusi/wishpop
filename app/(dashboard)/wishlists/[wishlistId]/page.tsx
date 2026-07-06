import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function WishlistEditorPage({ params }: { params: Promise<{ wishlistId: string }> }) {
  const { wishlistId } = await params;

  return (
    <main className="app-shell">
      <DashboardHeader title="Wishlist editor" eyebrow={`Wishlist ${wishlistId}`} />
      <section className="empty-panel">
        <h2>Owner editor goes here.</h2>
        <p>Important: this view must never show reservation status.</p>
      </section>
    </main>
  );
}
