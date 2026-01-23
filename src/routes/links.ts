import { Elysia, NotFoundError } from "elysia";

import * as links from "../functions/links";
import { LinkModel } from "../models";

// Type guard for SQLite constraint errors from libSQL/Drizzle
const isSQLiteConstraintError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  if (!("cause" in error)) return false;
  const cause = error.cause;
  if (!cause || typeof cause !== "object") return false;
  return "code" in cause && cause.code === "SQLITE_CONSTRAINT";
};

export const linksRoutes = new Elysia({ prefix: "/links" })
  .onError(({ error, status }) => {
    if (isSQLiteConstraintError(error)) {
      return status(409, "Code already in use");
    }
  })
  // Get all short links
  .get("", () => links.getAllLinks())
  // Get short link stats
  .get("/stats", () => links.getLinkStats())
  // Create a new short link
  .post(
    "",
    async ({ body, status }) => {
      const result = await links.insertLink({
        code: await links.validateCode(body.code),
        url: body.url,
      });

      return status(201, result);
    },
    { body: LinkModel.create },
  )
  // Update a short link
  .put(
    "/:code",
    async ({ params, body }) => {
      if (!(await links.codeAlreadyUsed(params.code))) throw new NotFoundError();
      return links.editLink(params.code, {
        code: await links.validateCode(body.code),
        url: body.url,
      });
    },
    { params: LinkModel.params, body: LinkModel.update },
  )
  // Delete a short link
  .delete(
    "/:code",
    async ({ params, status }) => {
      if (!(await links.codeAlreadyUsed(params.code))) throw new NotFoundError();
      await links.deleteLink(params.code);
      return status(204, "Deleted");
    },
    { params: LinkModel.params },
  );
