import { treaty } from "@elysiajs/eden";

import { createApp } from "../src/app";
import { env } from "../src/config/env";

export const app = createApp();

export const api = treaty(app, {
  headers: { Authorization: `Bearer ${env.API_KEY}` },
});
