import {
  pgTable,
  integer,
  timestamp,
  uuid,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entidades } from "./entidades.js";
import { detallesRecursos, recursos } from "./recursos.js";
import { personas, usuarios, vehiculos } from "./usuarios.js";
import { metodoMovimiento, estatusProceso } from "./enums.js";

export const inventarios = pgTable("inventarios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  entidadId: uuid("entidad_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  recursosId: uuid("recursos_id")
    .notNull()
    .references(() => recursos.id, { onDelete: "cascade" }),
  cantidad: integer("cantidad").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const movimientos = pgTable("movimientos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  inventarioId: uuid("inventario_id")
    .notNull()
    .references(() => inventarios.id, { onDelete: "cascade" }),
  personaId: uuid("persona_id").references(() => personas.id, {
    onDelete: "cascade",
  }),
  envioId: uuid("envio_id").references(() => envios.id, {
    onDelete: "set null",
  }),
  detallesId: uuid("detalles_id")
    .notNull()
    .references(() => detallesRecursos.id, { onDelete: "cascade" }),
  recursosId: uuid("recursos_id")
    .notNull()
    .references(() => recursos.id, { onDelete: "cascade" }),
  metodo: metodoMovimiento("metodo").notNull(),
  tipo: boolean("tipo").notNull(),
  cantidad: integer("cantidad").default(0).notNull(),
  lote: text("lote").notNull(),
  descripcion: text("descripcion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const envios = pgTable("envios", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  vehiculoId: uuid("vehiculo_id")
    .notNull()
    .references(() => vehiculos.id, { onDelete: "cascade" }),
  remitenteId: uuid("remitente_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  destinatarioId: uuid("destinatario_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  lote: integer("lote").notNull(),
  fechaSalida: timestamp("fecha_salida"),
  fechaLlegada: timestamp("fecha_llegada"),
  estado: estatusProceso("estado").default("PENDIENTE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const solicitudesRecursos = pgTable("solicitudes_recursos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  codigo: text("codigo").notNull().unique(),
  lote: integer("lote").notNull(),
  envioId: uuid("envio_id")
    .references(() => envios.id, { onDelete: "cascade" }),
  estatus: estatusProceso("estatus").default("PENDIENTE").notNull(),
  remitenteId: uuid("remitente_id")
    .references(() => entidades.id, { onDelete: "cascade" }),
  solicitanteId: uuid("solicitante_id")
    .notNull()
    .references(() => entidades.id, { onDelete: "cascade" }),
  recursoId: uuid("recurso_id")
    .notNull()
    .references(() => recursos.id, { onDelete: "cascade" }),
  cantidad: integer("cantidad").notNull(),
  descripcion: text("descripcion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});


