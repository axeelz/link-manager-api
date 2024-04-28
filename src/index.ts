import { Elysia, t } from "elysia";
import { linksRoutes } from "./routes/links";
import { SQLITE_CONSTRAINT, UNAUTHORIZED } from "./errors";
import { getLink, incrementRedirects } from "./functions/links";
import { cors } from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import { ip } from "elysia-ip";
import { UAParser } from "ua-parser-js";
import { getIPLocation } from "./functions/utils";
import { insertRedirect } from "./functions/redirects";
import { redirectsRoutes } from "./routes/redirects";
import bearer from "@elysiajs/bearer";
import { demoRoutes } from "./routes/demo";
import { NOT_FOUND_PAGE, PERSONAL_WEBSITE } from "./utils/constants";

const app = new Elysia()
  .use(cors())
  .use(helmet())
  .use(ip({ headersOnly: true }))
  .error({ SQLITE_CONSTRAINT, UNAUTHORIZED })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "NOT_FOUND":
        return { status: 404, message: "Not found" };
      case "VALIDATION":
        return error.validator.Errors(error.value).First();
      case "SQLITE_CONSTRAINT":
        if (error.message.includes("UNIQUE")) {
          set.status = 409;
          return { status: 409, message: "Code already in use" };
        }
        return { status: 500, message: error.message };
      case "UNAUTHORIZED":
        set.status = 401;
        return { status: 401, message: error.message };
      default:
        return { status: 500, message: error.message };
    }
  })
  // Logging
  .onResponse(({ path, request }) => {
    console.log(`🦊 ${request.method} - ${path}`);
  })
  // Mesure request performance
  .trace(async ({ handle }) => {
    const { time, end } = await handle;
    console.log("⏳ it took", (await end) - time, "ms");
  })
  // Health check
  .get("/ping", () => "pong")
  // Homepage redirects to personal website
  .get("/", ({ set }) => (set.redirect = PERSONAL_WEBSITE))
  // Link redirection, where all the magic happens
  .get(
    "/:code",
    async ({ params, set }) => {
      const link = await getLink(params.code);

      if (!link) {
        set.redirect = `${NOT_FOUND_PAGE}?code=${params.code}`;
      } else {
        set.status = 301;
        set.redirect = link.url;
      }
    },
    {
      params: t.Object({
        code: t.String(),
      }),
      // Save analytics data after redirection, for performance reasons
      async onResponse({ params, ip, headers }) {
        const link = await getLink(params.code);
        if (!link) {
          return;
        }

        const parser = new UAParser(headers["user-agent"]);
        const lang = headers["accept-language"]?.split(",")[0];
        const loc = await getIPLocation(ip);
        await insertRedirect({
          linkId: link.id,
          location: loc ? JSON.stringify(loc) : null,
          language: lang,
          referrer: headers["referer"],
          userAgent: JSON.stringify(parser.getResult()),
        });
        await incrementRedirects(params.code);
      },
    }
  )
  // For the demo page
  .use(demoRoutes)
  // All routes below this middleware require a valid API key
  .use(bearer())
  .onBeforeHandle(({ bearer }) => {
    if (!bearer || bearer !== process.env.API_KEY) {
      throw new UNAUTHORIZED("You don't have permission to perform this action");
    }
  })
  // Handle links and redirects actions
  .use(linksRoutes)
  .use(redirectsRoutes)
  .listen(3500);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
