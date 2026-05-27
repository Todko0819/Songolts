import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const hostCodesTable = pgTable("host_codes", {
  code: text("code").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  note: text("note"),
  usedAt: timestamp("used_at"),
  usedByName: text("used_by_name"),
  roomId: text("room_id"),
});

export type HostCode = typeof hostCodesTable.$inferSelect;
export type InsertHostCode = typeof hostCodesTable.$inferInsert;
