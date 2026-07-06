import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset password" subtitle="Get a secure link to regain access.">
      <p className="placeholder-copy">Password reset comes next.</p>
    </AuthShell>
  );
}
