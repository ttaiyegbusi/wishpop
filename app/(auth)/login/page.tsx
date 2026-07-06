import { AuthShell } from '@/components/auth/AuthShell';

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your wishlists.">
      <p className="placeholder-copy">Auth comes next. Connect this screen to Supabase Auth when ready.</p>
    </AuthShell>
  );
}
