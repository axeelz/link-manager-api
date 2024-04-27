import { describe, expect, it } from "bun:test";
import type { App } from "../src";
import { edenFetch, treaty } from "@elysiajs/eden";

const API_URL = process.env.API_URL as string;

const api = treaty<App>(API_URL);
const fetch = edenFetch<App>(API_URL);

describe("Elysia", () => {
  it("return a response", async () => {
    const { data, status } = await api.ping.get();

    expect(data).toBe("pong");
    expect(status).toBe(200);
  });

  it("return a 404", async () => {
    const { status } = await fetch("/:code", { method: "GET", params: { code: "not/found" } });

    expect(status).toBe(404);
  });
});

describe("Protected routes", () => {
  it("with invalid token", async () => {
    const { status } = await api.links.index.get({
      headers: {
        Authorization: "Bearer invalid",
      },
    });

    expect(status).toBe(401);
  });

  it("get all short links", async () => {
    const { status } = await api.links.index.get();

    expect(status).toBe(401);
  });

  it("get short link stats", async () => {
    const { status } = await api.links.stats.get();

    expect(status).toBe(401);
  });

  it("create a new short link", async () => {
    const { status } = await api.links.index.post({
      code: "test",
      url: "https://elysia.dev",
    });

    expect(status).toBe(401);
  });

  it("update a short link", async () => {
    const { status } = await api.links({ code: "test" }).put({
      code: "test2",
      url: "https://www.example.com",
    });

    expect(status).toBe(401);
  });

  it("delete a short link", async () => {
    const { status } = await fetch("/links/:code", {
      method: "DELETE",
      params: { code: "test" },
    });

    expect(status).toBe(401);
  });

  it("delete all short links", async () => {
    const { status } = await api.links.index.delete();

    expect(status).toBe(401);
  });

  it("get all redirects", async () => {
    const { status } = await api.redirects.index.get();

    expect(status).toBe(401);
  });
});
