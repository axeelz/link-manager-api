import { describe, expect, it } from "bun:test";

import { app } from "./setup";

describe("Elysia", () => {
  it("return a response", async () => {
    const response = await app.handle(new Request("http://localhost/ping"));

    expect(response.status).toBe(200);
    const data = await response.text();
    expect(data).toBe("pong");
  });

  it("return a 404 for invalid code", async () => {
    const response = await app.handle(new Request("http://localhost/notfound"));

    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("no-link");
  });
});

describe("Protected routes", () => {
  it("with invalid token", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        headers: {
          Authorization: "Bearer invalid",
        },
      }),
    );

    expect(response.status).toBe(401);
  });

  it("get all short links without auth", async () => {
    const response = await app.handle(new Request("http://localhost/links"));

    expect(response.status).toBe(401);
  });

  it("get short link stats without auth", async () => {
    const response = await app.handle(new Request("http://localhost/links/stats"));

    expect(response.status).toBe(401);
  });

  it("create a new short link without auth", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "test",
          url: "https://elysia.dev",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("update a short link without auth", async () => {
    const response = await app.handle(
      new Request("http://localhost/links/test", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "test2",
          url: "https://www.example.com",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("delete a short link without auth", async () => {
    const response = await app.handle(
      new Request("http://localhost/links/test", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("get all redirects without auth", async () => {
    const response = await app.handle(new Request("http://localhost/redirects"));

    expect(response.status).toBe(401);
  });
});
