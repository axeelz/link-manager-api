import { Elysia, NotFoundError } from "elysia";

import { getDemoLink } from "../functions/demo";

export const demoRoutes = new Elysia({ prefix: "/demo" }).get("/info", async () => {
  const link = await getDemoLink();
  if (!link) throw new NotFoundError();
  return link;
});
