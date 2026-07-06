import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { waitlistSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Waitlist database is not configured yet. Add Supabase environment variables.',
        },
        { status: 500 },
      );
    }

    const { email, source, referrer } = parsed.data;
    const { error } = await supabase
      .from('waitlist')
      .upsert(
        {
          email: email.toLowerCase(),
          source: source || 'landing_page',
          referrer: referrer || null,
        },
        { onConflict: 'email' },
      );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
}
