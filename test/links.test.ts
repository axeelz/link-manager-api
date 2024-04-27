import { describe, expect, it } from "bun:test";
import type { App } from "../src";
import { edenFetch, treaty } from "@elysiajs/eden";
import { SelectLink } from "../src/db/schema";

const API_URL = process.env.API_URL as string;

const api = treaty<App>(API_URL);
const fetch = edenFetch<App>(API_URL);

describe("Link creation", () => {
  const random10CharString = Math.random().toString(36).substring(2, 12);

  it("code too long", async () => {
    const { status } = await api.links.index.post(
      {
        code: "codeThatIsWayTooLong",
        url: "https://valid.url",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(422);
  });

  it("invalid URL", async () => {
    const { status } = await api.links.index.post(
      {
        code: "validCode", // valid code
        url: "invalidUrl", // invalid URL
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(400);
  });

  it("no URL specified", async () => {
    const { status } = await api.links.index.post(
      {
        code: "validCode",
      } as any,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(422);
  });

  it("create valid link", async () => {
    const urlToInsert = "https://valid.url";

    const { data, status } = await api.links.index.post(
      {
        code: random10CharString,
        url: urlToInsert,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    const insertedLink = (data as SelectLink[])[0];

    expect(status).toBe(201);
    expect(insertedLink.code).toBe(random10CharString);
    expect(insertedLink.url).toBe(urlToInsert);
    expect(insertedLink.redirects).toBe(0);
    expect(insertedLink.createdAt).toBeString();
    expect(insertedLink.id).toBeNumber();
  });

  it("code already in use", async () => {
    const { status } = await api.links.index.post(
      {
        code: random10CharString,
        url: "https://valid.url",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(409);
  });

  it("delete created link", async () => {
    const { status } = await fetch("/links/:code", {
      method: "DELETE",
      params: { code: random10CharString },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    });

    expect(status).toBe(204);
  });

  it("if no code, generate 4 char. random one", async () => {
    const { data, status } = await api.links.index.post(
      {
        url: "https://testing.url/",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    const insertedLink = (data as SelectLink[])[0];

    expect(status).toBe(201);
    expect(insertedLink.code).toHaveLength(4);

    // Cleanup
    const { status: deleteStatus } = await fetch("/links/:code", {
      method: "DELETE",
      params: { code: insertedLink.code },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    });

    expect(deleteStatus).toBe(204);
  });
});

describe("Link edition", () => {
  it("link doesn't exist", async () => {
    const { status } = await api.links({ code: "notfound" }).put(
      {
        code: "validCode",
        url: "https://valid.url",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(404);
  });

  const random10CharString = Math.random().toString(36).substring(2, 12);
  const urlToInsert = "https://valid.url";

  it("create link to edit", async () => {
    const { data, status } = await api.links.index.post(
      {
        code: random10CharString,
        url: urlToInsert,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(201);

    const insertedLink = (data as SelectLink[])[0];

    expect(insertedLink.code).toBe(random10CharString);
    expect(insertedLink.url).toBe(urlToInsert);
  });

  it("edit it with invalid URL", async () => {
    const { status } = await api.links({ code: random10CharString }).put(
      {
        code: "validCode",
        url: "invalidUrl",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(400);
  });

  const updatedUrl = "https://new.url";

  it("edit it with valid URL", async () => {
    const { status, data } = await api.links({ code: random10CharString }).put(
      {
        code: "validCode",
        url: updatedUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    expect(status).toBe(200);

    const updatedLink = (data as SelectLink[])[0];

    expect(updatedLink.url).toBe(updatedUrl);
    expect(updatedLink.code).toBe("validCode");
  });

  it("delete edited link", async () => {
    const { status } = await fetch("/links/:code", {
      method: "DELETE",
      params: { code: "validCode" },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    });

    expect(status).toBe(204);
  });
});

describe("Getters", () => {
  it("get stats", async () => {
    const { data, status } = await api.links.stats.get({
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    const stats = data as { totalLinks: number; totalRedirects: number };

    expect(status).toBe(200);
    expect(stats.totalLinks).toBeNumber();
    expect(stats.totalRedirects).toBeNumber();
  });

  it("get all links", async () => {
    const { data, status } = await api.links.index.get({
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    expect(status).toBe(200);
    expect(data).toBeArray();
  });
});
