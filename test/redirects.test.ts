import { describe, expect, it } from "bun:test";

import type { SelectLink, SelectRedirect } from "../src/db/schema";

import { api, app } from "./setup";

describe("Redirects", () => {
  const random10CharString = Math.random().toString(36).substring(2, 12);

  it("create a link to check", async () => {
    const { error } = await api.links.post({
      code: random10CharString,
      url: "https://example.com",
    });

    expect(error).toBeNull();
  });

  it("access the link", async () => {
    const response = await app.handle(
      new Request(`http://localhost/${random10CharString}`, {
        headers: { "accept-language": "en-US" },
      }),
    );

    // 301 permanent redirect for successful link
    expect(response.status).toBe(301);
  });

  it("redirect added", async () => {
    // Wait for afterResponse to complete (async analytics)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data, error } = await api.redirects.get();

    expect(error).toBeNull();
    expect(data).toBeArray();

    const entry = data!.find(
      (r: { redirects: SelectRedirect; links: SelectLink | null }) =>
        r.links?.code === random10CharString,
    );

    expect(entry).toBeDefined();
    expect(entry!.redirects).toBeObject();
    expect(entry!.links).toBeObject();
    expect(entry!.links?.id).toBe(entry!.redirects.linkId);
  });

  it("access without accept-language does not log redirect", async () => {
    await app.handle(new Request(`http://localhost/${random10CharString}`));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data } = await api.redirects.get();
    const count = data!.filter(
      (r: { redirects: SelectRedirect; links: SelectLink | null }) =>
        r.links?.code === random10CharString,
    ).length;

    expect(count).toBe(1); // still 1, not 2
  });

  it("delete the link", async () => {
    const { error } = await api.links({ code: random10CharString }).delete();
    expect(error).toBeNull();
  });
});
