import { db } from "$lib/server/db";
import { personas, estatusPersona } from "$lib/server/db/schema";
import { ilike, or, and, isNull, count, eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";

export const load = ({ url }) => {
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || "";
  const limit = 100;
  const offset = (page - 1) * limit;

  const whereClause = and(
    isNull(personas.deletedAt),
    search
      ? or(
          ilike(personas.nombre, `%${search}%`),
          ilike(personas.apellido, `%${search}%`),
        )
      : undefined,
  );

  // Carga de datos mediante promesas directas sin await para permitir streaming
  const personasPromise = db
    .select()
    .from(personas)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(personas.createdAt)
    .execute();

  const totalPromise = db
    .select({ total: count() })
    .from(personas)
    .where(whereClause)
    .execute();

  return {
    currentPage: page,
    search,
    streamed: {
      personas: personasPromise,
      totalCount: totalPromise.then((res) => res[0].total),
    },

    estatusPersona: estatusPersona.enumValues,
  };
};

export const actions = {
  verificar: async ({ request }) => {
    const data = await request.formData();
    const formData = Object.fromEntries(data.entries());

    const nombre = formData.nombre?.toString().trim();
    const apellido = formData.apellido?.toString().trim();
    const cedula = formData.cedula?.toString().trim();

    if (!nombre || !apellido) {
      return fail(400, {
        error: "NOMBRE Y APELLIDO SON OBLIGATORIOS.",
        ...formData,
      });
    }

    if (cedula) {
      const existente = await db
        .select()
        .from(personas)
        .where(eq(personas.cedula, cedula));
      if (existente.length > 0) {
        return fail(400, {
          error: "YA EXISTE UNA PERSONA REGISTRADA CON ESTA CÉDULA.",
          bloqueo: true,
          ...formData,
        });
      }
    }

    const coincidencias = await db
      .select()
      .from(personas)
      .where(
        and(
          ilike(personas.nombre, `%${nombre}%`),
          ilike(personas.apellido, `%${apellido}%`),
          isNull(personas.deletedAt),
        ),
      )
      .limit(5);

    return {
      success: true,
      coincidencias,
      bloqueo: false,
      ...formData,
    };
  },

  registrarPersona: async ({ request }) => {
    const data = await request.formData();

    const nombre = data.get("nombre")?.toString().trim();
    const apellido = data.get("apellido")?.toString().trim();
    const cedula = data.get("cedula")?.toString().trim() || null;
    const genero = data.get("genero")?.toString();
    const fechaNacimiento = data.get("fechaNacimiento")?.toString() || null;
    const caracteristicas = data.get("caracteristicas")?.toString().trim();
    const estado = data.get("estado")?.toString();
    const municipio = data.get("municipio")?.toString() || null;
    const localidad = data.get("localidad")?.toString() || null;
    const direccionExacta =
      data.get("direccionExacta")?.toString().trim() || null;
    const estatus = data.get("estatus")?.toString() || "desaparecido";
    const img = data.get("img")?.toString().trim() || null;

    if (!nombre || !apellido || !genero || !estado || !caracteristicas) {
      return fail(400, { error: "FALTAN CAMPOS OBLIGATORIOS POR COMPLETAR." });
    }

    try {
      await db.insert(personas).values({
        nombre,
        apellido,
        cedula,
        genero,
        fechaNacimiento,
        caracteristicas,
        estado,
        municipio,
        localidad,
        direccionExacta,
        estatus,
        img, // Inserción del nuevo campo string/text de la URL
      });

      return { exito: "CIUDADANO REGISTRADO EXITOSAMENTE EN EL SISTEMA." };
    } catch (error) {
      console.error("Error al insertar persona:", error);
      return fail(500, {
        error: "ERROR INTERNO AL REGISTRAR EN LA BASE DE DATOS.",
      });
    }
  },
};
