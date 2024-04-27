import Elysia from "elysia";
import { getAllRedirects } from "../functions/redirects";

export const redirectsRoutes = new Elysia({ prefix: "/redirects" })
  // Get all redirects
  .get("/", () => getAllRedirects());
