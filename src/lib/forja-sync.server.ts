import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STATE_ID = "forja-principal";

export async function getAppStateServer() {
  const { data, error } = await supabaseAdmin
    .from("forja_app_state")
    .select("*")
    .eq("id", STATE_ID)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is not found
    console.error("Error fetching app state:", error);
    throw error;
  }

  return data || null;
}

export async function updateAppStateServer(state: any, revision: number) {
  // 1. Get current to verify revision or handle initial insert
  const { data: current } = await supabaseAdmin
    .from("forja_app_state")
    .select("revision")
    .eq("id", STATE_ID)
    .single();

  const nextRevision = (current?.revision || 0) + 1;

  // 2. Insert into history before updating main state
  if (current) {
    await supabaseAdmin
      .from("forja_state_history")
      .insert({
        state_id: STATE_ID,
        state: state,
        revision: current.revision
      });
  }

  // 3. Upsert main state
  const { data, error } = await supabaseAdmin
    .from("forja_app_state")
    .upsert({
      id: STATE_ID,
      state,
      revision: nextRevision,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating app state:", error);
    throw error;
  }

  return data;
}
