import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { entidades } from "./entidades.js";

export const servicios = pgTable("servicios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  categoria: text("categoria").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const detallesServicios = pgTable("detalles_servicios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  servicioId: uuid("servicio_id")
    .notNull()
    .references(() => servicios.id, { onDelete: "cascade" }),
  modalidad: text("modalidad"),
  coberturaGeografica: text("cobertura_geografica"),
  requisitosPrevios: text("requisitos_previos"),
  disponibilidadHoraria: text("disponibilidad_horaria"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const solicitudesServicios = pgTable("solicitudes_servicios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  codigo: text("codigo").notNull().unique(), // Mantenemos text para el código si es alfanumérico legible
  estatus: text("estatus").default("PENDIENTE").notNull(),

  usuarioCreadorId: uuid("usuario_creador_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),

  entidadId: uuid("entidad_id").references(() => entidades.id, {
    onDelete: "set null",
  }),

  servicioId: uuid("servicio_id")
    .notNull()
    .references(() => servicios.id, { onDelete: "cascade" }),

  descripcionCaso: text("descripcion_caso").notNull(),
  fechaRequerida: date("fecha_requerida"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
