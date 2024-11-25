import { count, desc, eq, sql, sum } from "drizzle-orm";
import { db } from "../db/db";
import { InsertLink, SelectLink, linksTable } from "../db/schema";
import { generateCode } from "./utils";

export async function codeAlreadyUsed(code: SelectLink["code"]): Promise<boolean> {
  const link = await db.select().from(linksTable).where(eq(linksTable.code, code));
  return link.length > 0;
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

export async function incrementRedirects(code: SelectLink["code"]): Promise<void> {
  await db
    .update(linksTable)
    .set({ redirects: sql`${linksTable.redirects} + 1` })
    .where(eq(linksTable.code, code));
}

export async function deleteLink(code: SelectLink["code"]): Promise<void> {
  await db.delete(linksTable).where(eq(linksTable.code, code));
}

export async function deleteAllLinks(): Promise<void> {
  await db.delete(linksTable);
}

export async function getAllLinks(): Promise<SelectLink[]> {
  return db.select().from(linksTable).orderBy(desc(linksTable.id));
}

export async function getLinkStats(): Promise<{ totalLinks: number; totalRedirects: number }> {
  const totalLinks = await db.select({ count: count() }).from(linksTable);
  if (totalLinks[0].count === 0) return { totalLinks: 0, totalRedirects: 0 };
  const totalRedirects = await db.select({ sum: sum(linksTable.redirects).mapWith(Number) }).from(linksTable);
  return { totalLinks: totalLinks[0].count, totalRedirects: totalRedirects[0].sum };
}
