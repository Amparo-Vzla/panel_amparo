import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { categoriaDenuncia, categoriaReportes } from "./enums.js";

export const reportes = pgTable("reportes", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, {
    onDelete: "set null",
  }),
  categoria: categoriaReportes("categoria").default("OTROS").notNull(),
  descripcion: text("descripcion").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const denuncias = pgTable("denuncias", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  categoria: categoriaDenuncia("categoria").default("OTROS").notNull(),
  estado: text("estado").notNull(),
  municipio: text("municipio").notNull(),
  localidad: text("localidad").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
