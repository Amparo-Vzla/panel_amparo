import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { personas } from "./usuarios.js";
import { entidades } from "./entidades.js";

export const refugios = pgTable("refugios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull(),
  capacidad: integer("capacidad").notNull(),
  entidadId: uuid("entidad_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const refugiados = pgTable("refugiados", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  refugiadoId: uuid("refugiado_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  refugioId: uuid("refugio_id")
    .notNull()
    .references(() => refugios.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});