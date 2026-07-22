import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { entidades, tipoEntidad } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load = async () => {
  return {
    tipoEntidad: tipoEntidad.enumValues,
  };
};

export const actions = {
  logout: async ({ cookies }) => {
    cookies.delete("session_token", { path: "/" });
    throw redirect(303, "/");
  },

  crearEntidad: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const telefonoPrincipal = data.get("codigo1") + data.get("telefonoPrincipal")?.toString().trim();
    let telefonoSecundario = null;
    if (data.get("telefonoSecundario")){
      telefonoSecundario = data.get("codigo2") + data.get("telefonoSecundario")?.toString().trim();
    };

    const payload = {
      nombre: data.get("nombre")?.toString().trim(),
      tipo: data.get("tipo")?.toString(),
      telefonoPrincipal: telefonoPrincipal,
      telefonoSecundario: telefonoSecundario,
      emailContacto: data.get("emailContacto")?.toString().trim(),
      estado: data.get("estado")?.toString(),
      municipio: data.get("municipio")?.toString(),
      localidad: data.get("localidad")?.toString(),
      direccionExacta: data.get("direccionExacta")?.toString().trim(),
      latitud: data.get("latitud"),
      longitud: data.get("longitud"),
    };

    if (
      !payload.nombre ||
      !payload.tipo ||
      !payload.telefonoPrincipal ||
      !payload.emailContacto ||
      !payload.estado ||
      !payload.municipio ||
      !payload.localidad ||
      !payload.direccionExacta
    ) {
      return fail(400, { error: "Faltan campos obligatorios." });
    }

    try {
      const existe = await db
        .select()
        .from(entidades)
        .where(eq(entidades.encargadoId, locals.user.id))
        .limit(1);
      
      if (existe.length > 0) {
        return fail(400, { error: "Ya tienes una organización registrada." });
      }

      const codigoUnico = `VZLA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      await db.insert(entidades).values({
        ...payload,
        codigo: codigoUnico,
        encargadoId: locals.user.id,
        latitud: payload.latitud ? parseFloat(payload.latitud) : null,
        longitud: payload.longitud ? parseFloat(payload.longitud) : null,
        verificado: false,
        estatus: "ACTIVO",
      });

      return { exito: true, codigo: codigoUnico };
    } catch (err) {
      console.error("Error en insertar:", err);
      return fail(500, { error: "Error interno al procesar el registro." });
    }
  },
  deshacerEntidad: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });
    
    const data = await request.formData();
    const codigo = data.get("codigo")?.toString();

    if (codigo) {
      await db.delete(entidades).where(eq(entidades.codigo, codigo));
      return { error: "Error al subir el video. Intenta de nuevo."};
    }
    return fail(400);
  }
};