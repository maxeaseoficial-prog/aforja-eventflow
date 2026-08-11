import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAppStateServer, updateAppStateServer } from "./forja-sync.server";

export const getAppState = createServerFn({ method: "GET" })
  .handler(async () => {
    return getAppStateServer();
  });

export const updateAppState = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    state: z.any(),
    revision: z.number()
  }).parse(data))
  .handler(async ({ data }) => {
    return updateAppStateServer(data.state, data.revision);
  });
