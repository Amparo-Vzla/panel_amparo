import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import {
  reportes,
  denuncias,
  usuarios,
  //Enums
  categoriaReportes,
  categoriaDenuncia,
} from "$lib/server/db/schema";
import { isNull, desc, eq } from "drizzle-orm";
import geografiaVenezuela from "$lib/data/venezuela.json";

export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/login");
  return {
    geografia: geografiaVenezuela,
    reportes: db
      .select({
        id: reportes.id,
        descripcion: reportes.descripcion,
        createdAt: reportes.createdAt,
        usuarioNombre: usuarios.nombre,
        usuarioApellido: usuarios.apellido,
      })
      .from(reportes)
      .leftJoin(usuarios, eq(reportes.usuarioId, usuarios.id))
      .where(isNull(reportes.deletedAt))
      .orderBy(desc(reportes.createdAt)),
    denuncias: db
      .select()
      .from(denuncias)
      .where(isNull(denuncias.deletedAt))
      .orderBy(desc(denuncias.createdAt)),
    categoriaReportes: categoriaReportes.enumValues,
    categoriaDenuncia: categoriaDenuncia.enumValues,
  };
};

export const actions = {
  crearReporte: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const descripcion = data.get("descripcion")?.toString().trim();

    if (!descripcion || descripcion.length < 10) {
      return fail(400, {
        error: "La descripción debe poseer al menos 10 caracteres.",
      });
    }

    try {
      // Se remueve crypto.randomUUID(), delegando el identificador a la base de datos
      await db.insert(reportes).values({
        usuarioId: locals.user.id,
        descripcion,
      });

      return { exito: "Reporte registrado en la bitácora técnica." };
    } catch (err) {
      console.error("Error al crear reporte:", err);
      return fail(500, { error: `Error del servidor: ${err.message}` });
    }
  },

  registrarDenuncia: async ({ request }) => {
    const data = await request.formData();
    const titulo = data.get("titulo")?.toString().trim().toUpperCase();
    const descripcion = data.get("descripcion")?.toString().trim();
    const categoria = data.get("categoria")?.toString();

    const estado = data.get("estado")?.toString().trim().toUpperCase();
    const municipio = data.get("municipio")?.toString().trim().toUpperCase();
    const localidad = data.get("localidad")?.toString().trim().toUpperCase();

    if (
      !titulo ||
      !descripcion ||
      !categoria ||
      !estado ||
      !municipio ||
      !localidad
    ) {
      return fail(400, {
        error: "Todos los parámetros geográficos son obligatorios.",
      });
    }

    try {
      await db.insert(denuncias).values({
        titulo,
        descripcion,
        categoria,
        estado,
        municipio,
        localidad,
      });

      return { exito: "Denuncia comunitaria mapeada con éxito." };
    } catch (err) {
      return fail(500, {
        error: `Error en infraestructura: ${err.message}`,
      });
    }
  },
};
