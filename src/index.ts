import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp().listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
