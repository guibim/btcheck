import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const { token, email } = await req.json();

  if (!token && !email) {
    return new Response(JSON.stringify({ error: "Provide token or email" }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const filter = token
    ? { token }
    : { email: email.toLowerCase().trim() };

  const { error, count } = await supabase
    .from("subscribers")
    .update({ confirmed: false })
    .match(filter)
    .select("id", { count: "exact", head: true });

  if (error) {
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (count === 0) {
    return new Response(JSON.stringify({ error: "Subscriber not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "unsubscribed" }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
