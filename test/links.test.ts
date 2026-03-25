import { afterAll, describe, expect, it } from "bun:test";

import { api } from "./setup";

describe("Link creation", () => {
  const code = Math.random().toString(36).substring(2, 12);

  afterAll(async () => {
    await api.links({ code }).delete();
  });

  it("code too long", async () => {
    const { error } = await api.links.post({
      code: "codeThatIsWayTooLong",
      url: "https://valid.url",
    });
    expect(error?.status).toBe(422);
  });

  it("invalid URL", async () => {
    const { error } = await api.links.post({ code: "validCode", url: "invalidUrl" });
    expect(error?.status).toBe(422);
  });

  it("no URL specified", async () => {
    // @ts-expect-error — testing missing required field
    const { error } = await api.links.post({ code: "validCode" });
    expect(error?.status).toBe(422);
  });

  it("create valid link", async () => {
    const { data, error } = await api.links.post({ code, url: "https://valid.url" });
    expect(error).toBeNull();
    expect(data?.[0].code).toBe(code);
    expect(data?.[0].url).toBe("https://valid.url");
    expect(data?.[0].id).toBeNumber();
  });

  it("code already in use", async () => {
    const { error } = await api.links.post({ code, url: "https://valid.url" });
    expect(error?.status).toBe(409);
  });

  it("delete created link", async () => {
    const { error } = await api.links({ code }).delete();
    expect(error).toBeNull();
  });

  it("if no code, generate 4 char. random one", async () => {
    // @ts-expect-error — testing missing required field
    const { data, error } = await api.links.post({ url: "https://testing.url/" });
    expect(error).toBeNull();
    expect(data?.[0].code).toHaveLength(4);

    await api.links({ code: data![0].code }).delete();
  });
});

describe("Link edition", () => {
  const code = Math.random().toString(36).substring(2, 12);

  afterAll(async () => {
    await api.links({ code: "validCode" }).delete();
  });

  it("link doesn't exist", async () => {
    const { status } = await api
      .links({ code: "notfound" })
      .put({ code: "validCode", url: "https://valid.url" });
    expect(status).toBe(404);
  });

  it("create link to edit", async () => {
    const { data, error } = await api.links.post({ code, url: "https://valid.url" });
    expect(error).toBeNull();
    expect(data?.[0].code).toBe(code);
  });

  it("edit it with invalid URL", async () => {
    const { error } = await api.links({ code }).put({ code: "validCode", url: "invalidUrl" });
    expect(error?.status).toBe(422);
  });

  it("edit it with valid URL", async () => {
    const { data, error } = await api
      .links({ code })
      .put({ code: "validCode", url: "https://new.url" });
    expect(error).toBeNull();
    expect(data?.[0].url).toBe("https://new.url");
    expect(data?.[0].code).toBe("validCode");
  });

  it("delete edited link", async () => {
    const { error } = await api.links({ code: "validCode" }).delete();
    expect(error).toBeNull();
  });

  it("delete non-existent link", async () => {
    const { status } = await api.links({ code: "notfound" }).delete();
    expect(status).toBe(404);
  });
});

describe("Getters", () => {
  it("get stats", async () => {
    const { data, error } = await api.links.stats.get();
    expect(error).toBeNull();
    expect(data?.totalLinks).toBeNumber();
    expect(data?.totalRedirects).toBeNumber();
  });

  it("get all links", async () => {
    const { data, error } = await api.links.get();
    expect(error).toBeNull();
    expect(data).toBeArray();
    expect(data?.[0].redirects).toBeNumber();
  });
});
