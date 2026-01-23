import { createApp } from "../src/app";
import { env } from "../src/config/env";

export const app = createApp();

export const authHeaders = {
  Authorization: `Bearer ${env.API_KEY}`,
};
