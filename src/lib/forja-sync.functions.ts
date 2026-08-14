import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAppStateServer, updateAppStateServer } from "./forja-sync.server";

export const getAppState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getAppStateServer(context.supabase, context.userId);
  });

export const updateAppState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({
    state: z.any(),
    revision: z.number()
  }))
  .handler(async ({ data, context }) => {
    return updateAppStateServer(context.supabase, context.userId, data.state, data.revision);
  });

