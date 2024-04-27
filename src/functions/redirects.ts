import { desc, eq } from "drizzle-orm";
import { db } from "../db/db";
import { InsertRedirect, SelectLink, SelectRedirect, linksTable, redirectsTable } from "../db/schema";

export async function insertRedirect(data: InsertRedirect): Promise<SelectRedirect[]> {
  return await db.insert(redirectsTable).values(data).returning();
}

export async function getAllRedirects(): Promise<{ redirects: SelectRedirect; links: SelectLink | null }[]> {
  return db
    .select()
    .from(redirectsTable)
    .leftJoin(linksTable, eq(redirectsTable.linkId, linksTable.id))
    .orderBy(desc(redirectsTable.id));
}
