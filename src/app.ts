import bearer from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { helmet } from "elysia-helmet";
import { ip } from "elysia-ip";
import { UAParser } from "ua-parser-js";

import * as links from "./functions/links";
import { getAllRedirects, insertRedirect } from "./functions/redirects";
import { getIPLocation, isPotentialBot } from "./functions/utils";
import { demoRoutes } from "./routes/demo";
import { linksRoutes } from "./routes/links";
import { requireAuth } from "./utils/auth";
import { NOT_FOUND_PAGE, PERSONAL_WEBSITE } from "./utils/constants";

export const createApp = () =>
  new Elysia()
    .use(cors())
    .use(helmet())
    .use(ip({ headersOnly: true }))
    // Logging & performance
    .onBeforeHandle(({ path, request }) => console.log(`🦊 ${request.method} - ${path}`))
    .trace(async ({ onHandle }) => {
      onHandle(({ begin, onStop }) => onStop(({ end }) => console.log("⏳", end - begin, "ms")));
    })

    // Public routes
    .get("/ping", () => "pong")
    .get("/", ({ redirect }) => redirect(PERSONAL_WEBSITE))
    .use(demoRoutes)

    // Link redirection
    .get(
      "/:code",
      async ({ params, redirect }) => {
        const link = await links.getLink(params.code);
        return link ? redirect(link.url, 301) : redirect(`${NOT_FOUND_PAGE}?code=${params.code}`);
      },
      {
        params: t.Object({ code: t.String() }),
        async afterResponse({ params, ip, headers }) {
          const link = await links.getLink(params.code);
          const userAgent = headers["user-agent"];
          if (!link || isPotentialBot(userAgent) || !headers["accept-language"]) return;
          await insertRedirect({
            linkId: link.id,
            location: JSON.stringify(await getIPLocation(ip)) ?? null,
            language: headers["accept-language"].split(",")[0],
            referrer: headers["referer"],
            userAgent: JSON.stringify(new UAParser(userAgent).getResult()),
          });
        },
      },
    )

    // Protected routes
    .use(bearer())
    .onBeforeHandle(requireAuth)
    .use(linksRoutes)
    .get("/redirects", () => getAllRedirects());
