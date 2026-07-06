import { AuthShell } from '@/components/auth/AuthShell';

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start building wishlists people can reserve from.">
      <p className="placeholder-copy">Signup comes next. This page is reserved for Supabase Auth.</p>
    </AuthShell>
  );
}
