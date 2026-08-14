import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAppStateServer, updateAppStateServer } from "./forja-sync.server";

export const getAppState = createServerFn({ method: "GET" })
  .handler(async () => {
    return getAppStateServer();
  });

export const updateAppState = createServerFn({ method: "POST" })
  .validator(z.object({
    state: z.any(),
    revision: z.number()
  }))
  .handler(async ({ data }) => {
    return updateAppStateServer(data.state, data.revision);
  });


