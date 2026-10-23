import { createClient } from '@supabase/supabase-js';

// Never cache: every call must reach the database.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // If CRON_SECRET is set on Vercel, only Vercel Cron (which sends it) can trigger a ping.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ status: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json(
      { status: 'error', message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set' },
      { status: 500 }
    );
  }

  // Created per request so a missing env var returns an error instead of crashing the route.
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('keepalive_ping');

  if (error) {
    return Response.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return Response.json({ status: 'ok', pingedAt: data });
}
