import { describe, expect, it } from "bun:test";
import type { App } from "../src";
import { edenFetch, treaty } from "@elysiajs/eden";
import { SelectLink, SelectRedirect } from "../src/db/schema";

const API_URL = process.env.API_URL as string;

const api = treaty<App>(API_URL);
const fetch = edenFetch<App>(API_URL);

describe("Redirects", () => {
  const random10CharString = Math.random().toString(36).substring(2, 12);

  it("create a link to check", async () => {
    const { status } = await api.links.index.post(
      {
        code: random10CharString,
        url: "https://example.com",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(201);
  });

  it("access the link", async () => {
    const { status } = await fetch("/:code", {
      method: "GET",
      params: { code: random10CharString },
    });

    expect(status).toBe(200);
  });

  it("redirect added", async () => {
    const { data, status } = await api.redirects.index.get({
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    expect(status).toBe(200);
    expect(data).toBeArray();

    const redirectsAndLinks = data as { redirects: SelectRedirect; links: SelectLink | null }[];
    const last = redirectsAndLinks[0];

    expect(last.redirects).toBeObject();
    expect(last.links).toBeObject();
    expect(last.links?.code).toBe(random10CharString);
    expect(last.links?.id).toBe(last.redirects.linkId);
  });

  it("delete the link", async () => {
    const { status } = await fetch("/links/:code", {
      method: "DELETE",
      params: { code: random10CharString },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    });

    expect(status).toBe(204);
  });
});
