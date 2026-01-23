import { describe, expect, it } from "bun:test";

import { SelectLink } from "../src/db/schema";
import { app, authHeaders } from "./setup";

describe("Link creation", () => {
  const random10CharString = Math.random().toString(36).substring(2, 12);

  it("code too long", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "codeThatIsWayTooLong",
          url: "https://valid.url",
        }),
      }),
    );

    expect(response.status).toBe(422);
  });

  it("invalid URL", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "validCode",
          url: "invalidUrl",
        }),
      }),
    );

    expect(response.status).toBe(422);
  });

  it("no URL specified", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "validCode" }),
      }),
    );

    expect(response.status).toBe(422);
  });

  it("create valid link", async () => {
    const urlToInsert = "https://valid.url";

    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: random10CharString,
          url: urlToInsert,
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as SelectLink[];
    expect(data).toBeArray();

    if (!data) throw new Error("No data returned");
    const insertedLink = data[0] as SelectLink;
    expect(insertedLink.code).toBe(random10CharString);
    expect(insertedLink.url).toBe(urlToInsert);
    expect(insertedLink.redirects).toBe(0);
    expect(insertedLink.createdAt).toBeDefined();
    expect(insertedLink.id).toBeNumber();
  });

  it("code already in use", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: random10CharString,
          url: "https://valid.url",
        }),
      }),
    );

    expect(response.status).toBe(409);
  });

  it("delete created link", async () => {
    const response = await app.handle(
      new Request(`http://localhost/links/${random10CharString}`, {
        method: "DELETE",
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(204);
  });

  it("if no code, generate 4 char. random one", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: "https://testing.url/" }),
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as SelectLink[];
    expect(data).toBeArray();

    const insertedLink = data[0];
    expect(insertedLink.code).toHaveLength(4);

    // Cleanup
    const deleteResponse = await app.handle(
      new Request(`http://localhost/links/${insertedLink.code}`, {
        method: "DELETE",
        headers: authHeaders,
      }),
    );

    expect(deleteResponse.status).toBe(204);
  });
});

describe("Link edition", () => {
  it("link doesn't exist", async () => {
    const response = await app.handle(
      new Request("http://localhost/links/notfound", {
        method: "PUT",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "validCode",
          url: "https://valid.url",
        }),
      }),
    );

    expect(response.status).toBe(404);
  });

  const random10CharString = Math.random().toString(36).substring(2, 12);
  const urlToInsert = "https://valid.url";

  it("create link to edit", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: random10CharString,
          url: urlToInsert,
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as SelectLink[];
    expect(data).toBeArray();

    if (!data) throw new Error("No data returned");
    const insertedLink = data[0] as SelectLink;
    expect(insertedLink.code).toBe(random10CharString);
    expect(insertedLink.url).toBe(urlToInsert);
  });

  it("edit it with invalid URL", async () => {
    const response = await app.handle(
      new Request(`http://localhost/links/${random10CharString}`, {
        method: "PUT",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "validCode",
          url: "invalidUrl",
        }),
      }),
    );

    expect(response.status).toBe(422);
  });

  const updatedUrl = "https://new.url";

  it("edit it with valid URL", async () => {
    const response = await app.handle(
      new Request(`http://localhost/links/${random10CharString}`, {
        method: "PUT",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "validCode",
          url: updatedUrl,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as SelectLink[];
    expect(data).toBeArray();

    if (!data) throw new Error("No data returned");
    const updatedLink = data[0] as SelectLink;
    expect(updatedLink.url).toBe(updatedUrl);
    expect(updatedLink.code).toBe("validCode");
  });

  it("delete edited link", async () => {
    const response = await app.handle(
      new Request("http://localhost/links/validCode", {
        method: "DELETE",
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(204);
  });
});

describe("Getters", () => {
  it("get stats", async () => {
    const response = await app.handle(
      new Request("http://localhost/links/stats", {
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { totalLinks: number; totalRedirects: number };
    expect(data).toBeObject();

    if (!data) throw new Error("No data returned");
    expect(data.totalLinks).toBeNumber();
    expect(data.totalRedirects).toBeNumber();
  });

  it("get all links", async () => {
    const response = await app.handle(
      new Request("http://localhost/links", {
        headers: authHeaders,
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeArray();
  });
});
