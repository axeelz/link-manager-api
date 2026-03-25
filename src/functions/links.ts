import { count, desc, eq } from "drizzle-orm";

import { db } from "../db/db";
import { InsertLink, SelectLink, linksTable, redirectsTable } from "../db/schema";
import { generateCode } from "./utils";

async function codeAlreadyUsed(code: SelectLink["code"]): Promise<boolean> {
  const result = await db
    .select({ id: linksTable.id })
    .from(linksTable)
    .where(eq(linksTable.code, code))
    .get();
  return result !== undefined;
}

export async function validateCode(code: string | undefined): Promise<string> {
  if (!code || code.includes("/")) {
    let generatedCode = "";
    do {
      generatedCode = generateCode();
    } while (await codeAlreadyUsed(generatedCode));
    return generatedCode;
  } else {
    return code;
  }
}

export async function insertLink(data: InsertLink): Promise<SelectLink[]> {
  return await db.insert(linksTable).values(data).returning();
}

export async function getLink(code: SelectLink["code"]): Promise<SelectLink | null> {
  const url = await db.select().from(linksTable).where(eq(linksTable.code, code)).get();
  return url ?? null;
}

export async function editLink(code: SelectLink["code"], data: InsertLink): Promise<SelectLink[]> {
  return await db.update(linksTable).set(data).where(eq(linksTable.code, code)).returning();
}

export async function deleteLink(code: SelectLink["code"]): Promise<boolean> {
  const result = await db
    .delete(linksTable)
    .where(eq(linksTable.code, code))
    .returning({ id: linksTable.id });
  return result.length > 0;
}


export async function getAllLinks() {
  return db
    .select({
      id: linksTable.id,
      code: linksTable.code,
      url: linksTable.url,
      redirects: count(redirectsTable.id),
      createdAt: linksTable.createdAt,
    })
    .from(linksTable)
    .leftJoin(redirectsTable, eq(redirectsTable.linkId, linksTable.id))
    .groupBy(linksTable.id)
    .orderBy(desc(linksTable.id));
}

export async function getLinkStats(): Promise<{ totalLinks: number; totalRedirects: number }> {
  const [[{ totalLinks }], [{ totalRedirects }]] = await Promise.all([
    db.select({ totalLinks: count() }).from(linksTable),
    db.select({ totalRedirects: count() }).from(redirectsTable),
  ]);
  return { totalLinks, totalRedirects };
}
