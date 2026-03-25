import type { Context } from "elysia";

import { env } from "../config/env";

export const requireAuth = ({ bearer, status }: Pick<Context, "status"> & { bearer?: string }) => {
  if (!bearer || bearer !== env.API_KEY) {
    return status(401, "Unauthorized");
  }
};
