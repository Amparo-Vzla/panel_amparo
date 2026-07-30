import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { entidades } from "./entidades.js";

export const pacientes = pgTable("pacientes", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  entidadId: uuid("entidad_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  cedula: text("cedula"),
  genero: text("genero").notNull(),
  fechaNacimiento: text("fecha_nacimiento").notNull(),
  condicion: text("condicion").notNull(),
  diagnostico: text("diagnostico").notNull(),
  estatus: text("estatus").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const publicaciones = pgTable("publicaciones", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  redaccion: text("redaccion").notNull(),
  linkDrive: text("link_drive"),
  linkRedes: text("link_redes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const animales = pgTable("registro_animales", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  entidadId: uuid("entidad_id").references(() => entidades.id, {
    onDelete: "set null",
  }),
  especie: text("especie").notNull(),
  raza: text("raza"),
  condicion: text("condicion").notNull(),
  estatus: text("estatus").notNull(),
  detalles: text("detalles").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
