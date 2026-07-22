import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { roles, estatusPersona, tiposTransporte } from "./enums.js";

// --- Tablas de Referencia (UUIDs) ---

export const profesiones = pgTable("profesiones", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull().unique(),
});

export const puestos = pgTable("puestos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull().unique(),
});

export const areasColaboracion = pgTable("areas_colaboracion", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion"),
});

export const talentos = pgTable("talentos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull().unique(),
});

export const personas = pgTable("personas", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  img: text("img"),
  cedula: text("cedula").unique(),
  genero: text("genero").notNull(),
  tipoSangre: text("tipo_sangre"),
  telefono: text("telefono"),
  fechaNacimiento: text("fecha_nacimiento").notNull(),
  caracteristicas: text("caracteristicas").notNull(),
  estado: text("estado").notNull(),
  municipio: text("municipio"),
  localidad: text("localidad"),
  direccionExacta: text("direccion_exacta"),
  estatus: estatusPersona("estatus").default("DESAPARECIDO").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    personaId: uuid("persona_id").references(() => personas.id, {
      onDelete: "set null",
    }),
    nombre: text("nombre").notNull(),
    apellido: text("apellido").notNull(),
    nacionalidad: text("nacionalidad").default("V").notNull(),
    cedula: text("cedula").notNull(),
    genero: text("genero").notNull(),
    telefono: text("telefono"),
    fechaNacimiento: text("fecha_nacimiento").notNull(),
    tipoSangre: text("tipo_sangre"),

    // Auth
    rol: roles("rol").default("VOLUNTARIO").notNull(),
    correo: text("correo").notNull().unique(),
    password: text("password").notNull(),

    // Relaciones
    profesionId: uuid("profesion_id").references(() => profesiones.id, {
      onDelete: "set null",
    }),
    puestoId: uuid("puesto_id").references(() => puestos.id, {
      onDelete: "set null",
    }),
    talento1: uuid("talento_1").references(() => talentos.id, {
      onDelete: "set null",
    }),
    talento2: uuid("talento_2").references(() => talentos.id, {
      onDelete: "set null",
    }),
    talento3: uuid("talento_3").references(() => talentos.id, {
      onDelete: "set null",
    }),
    talento4: uuid("talento_4").references(() => talentos.id, {
      onDelete: "set null",
    }),

    colaboracion1: uuid("colaboracion_1").references(
      () => areasColaboracion.id,
      { onDelete: "set null" },
    ),
    colaboracion2: uuid("colaboracion_2").references(
      () => areasColaboracion.id,
      { onDelete: "set null" },
    ),
    colaboracion3: uuid("colaboracion_3").references(
      () => areasColaboracion.id,
      { onDelete: "set null" },
    ),
    colaboracion4: uuid("colaboracion_4").references(
      () => areasColaboracion.id,
      { onDelete: "set null" },
    ),

    disponibilidad: text("disponibilidad"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    idxProfesion: index("idx_usuarios_profesion").on(t.profesionId),
    idxPuesto: index("idx_usuarios_puesto").on(t.puestoId),
    idxCedula: index("idx_usuarios_cedula").on(t.cedula),
  }),
);

export const vehiculos = pgTable("vehiculos", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, {
    onDelete: "cascade",
  }),
  tipo: tiposTransporte("tipo").default("CARRO").notNull(),
  marca: text("marca").notNull(),
  placa: text("placa").notNull().unique(),
  modelo: text("modelo"),
  color: text("color"),
  estatus: text("estatus").default("ACTIVO").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
