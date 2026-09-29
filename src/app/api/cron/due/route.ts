import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !serviceKey) return new Response("Cron belum dikonfigurasi", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: organizations, error } = await supabase.from("organizations").select("id");
  if (error) return new Response("Gagal memuat organisasi", { status: 500 });
  let processed = 0;
  for (const org of organizations ?? []) {
    const result = await supabase.rpc("due_notifications", { p_organization_id: org.id });
    if (result.error) return new Response("Gagal memperbarui pengingat", { status: 500 });
    processed += Number(result.data ?? 0);
  }
  return Response.json({ processed });
}
