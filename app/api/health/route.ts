import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { error } = await supabase
    .from('foods')
    .select('id')
    .limit(1);

  if (error) {
    return Response.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}