import { describe, expect, it } from "bun:test";

import { SelectLink, SelectRedirect } from "../src/db/schema";
import { app, authHeaders } from "./setup";

describe("Redirects", () => {
  const random10CharString = Math.random().toString(36).substring(2, 12);

  it("create a link to check", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: random10CharString,
          url: "https://example.com",
        }),
      }),
    );

    expect(response.status).toBe(201);
  });

  it("access the link", async () => {
    const response = await app.handle(new Request(`http://localhost/${random10CharString}`));

    // 301 permanent redirect for successful link
    expect(response.status).toBe(301);
  });

  it("redirect added", async () => {
    // Wait for afterResponse to complete (async analytics)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await app.handle(
      new Request("http://localhost/redirects", {
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as Array<{
      redirects: SelectRedirect;
      links: SelectLink | null;
    }>;
    expect(data).toBeArray();

    const redirectsAndLinks = data;
    const last = redirectsAndLinks[0];

    expect(last.redirects).toBeObject();
    expect(last.links).toBeObject();
    expect(last.links?.code).toBe(random10CharString);
    expect(last.links?.id).toBe(last.redirects.linkId);
  });

  it("delete the link", async () => {
    const response = await app.handle(
      new Request(`http://localhost/links/${random10CharString}`, {
        method: "DELETE",
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(204);
  });
});
