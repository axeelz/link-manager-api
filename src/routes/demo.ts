import Elysia, { NotFoundError } from "elysia";
import { getDemoLink } from "../functions/demo";

export const demoRoutes = new Elysia({ prefix: "/demo" })
  // Get the link with code "demo"
  .get("/info", async () => {
    const demoLink = await getDemoLink();
    if (!demoLink) {
      throw new NotFoundError();
    }
    return demoLink;
  });
