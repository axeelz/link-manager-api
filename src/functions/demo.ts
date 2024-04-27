import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { SelectLink, linksTable } from "../db/schema";

export async function getDemoLink(): Promise<SelectLink | null> {
  const url = await db.select().from(linksTable).where(eq(linksTable.code, "demo")).get();
  return url ?? null;
}
