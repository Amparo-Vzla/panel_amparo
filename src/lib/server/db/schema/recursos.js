import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entidades } from "./entidades.js";
import { categoriaRecurso } from "./enums.js";

export const recursos = pgTable("recursos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  categoria: categoriaRecurso("categoria").default("OTROS").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const detallesRecursos = pgTable("detalles_recursos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  presentacion: text("presentacion"),
  vencimiento: date("vencimiento"),
  estado: text("estado"),
  talla: text("talla"),
  genero: text("genero"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


