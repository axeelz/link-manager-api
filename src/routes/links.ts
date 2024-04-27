import Elysia, { NotFoundError, t } from "elysia";
import {
  getAllLinks,
  insertLink,
  codeAlreadyUsed,
  getLinkStats,
  deleteLink,
  deleteAllLinks,
  editLink,
} from "../functions/links";
import { generateCode, isValidUrl } from "../functions/utils";

export const linksRoutes = new Elysia({ prefix: "/links" })
  // Get all short links
  .get("/", () => getAllLinks())
  // Get short link stats
  .get("/stats", () => getLinkStats())
  // Create a new short link
  .post(
    "/",
    async ({ body, set }) => {
      if (!isValidUrl(body.url)) {
        set.status = 400;
        return { status: 400, message: "Invalid URL" };
      }
      if (!body.code || body.code.includes("/")) {
        do {
          body.code = generateCode();
        } while (await codeAlreadyUsed(body.code));
      }
      const insertedLink = await insertLink(body as { code: string; url: string });
      set.status = 201;
      return insertedLink;
    },
    {
      body: t.Object({
        code: t.Optional(t.String({ maxLength: 10 })),
        url: t.String(),
      }),
    }
  )
  // Update a short link
  .put(
    "/:code",
    async ({ params, body, set }) => {
      if (!(await codeAlreadyUsed(params.code))) {
        throw new NotFoundError();
      }
      if (!isValidUrl(body.url)) {
        set.status = 400;
        return { status: 400, message: "Invalid URL" };
      }
      const updatedLink = await editLink(params.code, body as { code: string; url: string });
      set.status = 200;
      return updatedLink;
    },
    {
      params: t.Object({
        code: t.String(),
      }),
      body: t.Object({
        code: t.Optional(t.String({ maxLength: 10 })),
        url: t.String(),
      }),
    }
  )
  // Delete a short link
  .delete(
    "/:code",
    async ({ params, set }) => {
      if (!(await codeAlreadyUsed(params.code))) {
        throw new NotFoundError();
      }
      await deleteLink(params.code);
      set.status = 204;
      return {
        status: 204,
        message: "Link deleted",
      };
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    }
  )
  // Delete all short links
  .delete("/", async ({ set }) => {
    await deleteAllLinks();
    set.status = 204;
    return {
      status: 204,
      message: "All links deleted",
    };
  });
