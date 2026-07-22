import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  boolean,
  integer,
  unique,
  index,
  uuid,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { usuarios, profesiones, areasColaboracion, puestos } from "./usuarios.js";
import { estatusEntidad, tipoEntidad } from "./enums.js";

// --- Entidades ---
export const entidades = pgTable("entidades", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  codigo: text("codigo").notNull().unique(),
  encargadoId: uuid("usuario_id")
    .notNull()
    .unique()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  tipo: tipoEntidad("tipo").default("ACOPIO").notNull(),
  nombre: text("nombre").notNull(),
  telefonoPrincipal: text("telefono_principal").notNull(),
  telefonoSecundario: text("telefono_secundario"),
  emailContacto: text("email_contacto"),

  // --- UBICACIÓN ---
  estado: text("estado").notNull(),
  municipio: text("municipio").notNull(),
  localidad: text("localidad").notNull(),
  direccionExacta: text("direccion_exacta").notNull(),
  latitud: doublePrecision("latitud"),
  longitud: doublePrecision("longitud"),

  // --- ESTADO ---
  verificado: boolean("verificado").default(false).notNull(),
  estatus: estatusEntidad("estatus").default("ACTIVO").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// --- Personal ---
export const personal = pgTable(
  "personal",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    entidadId: uuid("entidad_id")
      .notNull()
      .references(() => entidades.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    puestoId: uuid("puesto_id").references(() => puestos.id, {
      onDelete: "set null",
    }),
    rol: text("rol").default("voluntario").notNull(),
    estatus: text("estatus").default("pendiente").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueEntidadUser: unique("unique_entidad_user").on(
      t.entidadId,
      t.usuarioId,
    ),
    idxEntidadStatus: index("idx_entidad_status").on(t.entidadId, t.estatus),
  }),
);

// --- Vacantes ---
export const vacantes = pgTable("vacantes", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  codigo: text("codigo").notNull().unique(),
  tipo: text("tipo").notNull(), //solicitud o vacante
  estatus: text("estatus").default("ABIERTA").notNull(),
  usuarioCreadorId: uuid("usuario_creador_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  entidadId: uuid("entidad_id").references(() => entidades.id, {
    onDelete: "cascade",
  }),
  puestoId: uuid("puesto_id").references(() => puestos.id, {
    onDelete: "set null",
  }),
  profesionId: uuid("profesion_id").references(() => profesiones.id, {
    onDelete: "set null",
  }),
  areaColaboracionId: uuid("area_colaboracion_id").references(
    () => areasColaboracion.id,
    { onDelete: "set null" },
  ),
  descripcion: text("descripcion").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
