// src/routes/dashboard/acopio/solicitudes/+page.server.js
import { db } from "$lib/server/db";
import { solicitudesRecursos, recursos, entidades, categoriaRecurso } from "$lib/server/db/schema";
import { desc, isNull, eq, inArray, and } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { fail } from "@sveltejs/kit";

const entidadesRemitentes = aliasedTable(entidades, "entidades_remitentes");

export function load({ locals }) {
  const miEntidadId = locals.user?.entidadId || null;

  return {
    miEntidadId,
    recursos: db.select().from(recursos).orderBy(recursos.nombre).execute(),
    categoriaRecurso: categoriaRecurso.enumValues,
    solicitudes: db
      .select({
        id: solicitudesRecursos.id,
        codigo: solicitudesRecursos.codigo,
        lote: solicitudesRecursos.lote,
        estatus: solicitudesRecursos.estatus,
        cantidad: solicitudesRecursos.cantidad,
        descripcion: solicitudesRecursos.descripcion,
        createdAt: solicitudesRecursos.createdAt,
        recursoNombre: recursos.nombre,
        recursoCategoria: recursos.categoria, 
        solicitanteCod: entidades.codigo, 
        solicitanteTipo: entidades.tipo,
        solicitanteId: solicitudesRecursos.solicitanteId,
        remitenteId: solicitudesRecursos.remitenteId,
        remitenteCod: entidadesRemitentes.codigo
      })
      .from(solicitudesRecursos)
      .innerJoin(recursos, eq(solicitudesRecursos.recursoId, recursos.id))
      .innerJoin(entidades, eq(solicitudesRecursos.solicitanteId, entidades.id))
      .leftJoin(entidadesRemitentes, eq(solicitudesRecursos.remitenteId, entidadesRemitentes.id))
      .where(isNull(solicitudesRecursos.deletedAt))
      .orderBy(desc(solicitudesRecursos.createdAt))
      .execute()
  };
}

export const actions = {
  crearSolicitudAgrupada: async ({ request, locals }) => {
    const formData = await request.formData();
    const recursoIds = formData.getAll("recursoId");
    const cantidades = formData.getAll("cantidad");
    const descripcion = formData.get("descripcion");

    if (!recursoIds.length) return fail(400, { error: "El lote debe contener al menos un recurso." });

    const miEntidadId = locals.user?.entidadId; 
    if (!miEntidadId) return fail(403, { error: "No tiene entidad asignada." });

    const numeroLote = Math.floor(100000 + Math.random() * 900000);

    try {
      const registros = recursoIds.map((recursoId, index) => ({
        codigo: `REQ-${numeroLote}-${index + 1}`,
        lote: numeroLote,
        solicitanteId: miEntidadId,
        recursoId: recursoId,
        cantidad: parseInt(cantidades[index], 10),
        descripcion: descripcion || null,
        estatus: "PENDIENTE"
      }));

      await db.insert(solicitudesRecursos).values(registros);
      return { exito: "Solicitud Creada" };
    } catch (err) {
      console.error(err);
      return fail(500, { error: "Error al registrar lote." });
    }
  },
  responderItems: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemIds = formData.getAll('itemIds');
    const miEntidadId = locals.user?.entidadId || null;

    if (!miEntidadId || itemIds.length === 0) return { success: false };

    for (const id of itemIds) {
      await db.update(solicitudesRecursos)
        .set({ 
          estatus: 'EN PROCESO', 
          remitenteId: miEntidadId 
        })
        .where(eq(solicitudesRecursos.id, id))
        .execute();
    }

    return { success: true };
  },

  cancelarLote: async ({ request }) => {
    const formData = await request.formData();
    const loteId = formData.get('lote');

    if (!loteId) return { success: false };

    await db.update(solicitudesRecursos)
      .set({ 
        estatus: 'CANCELADO', 
        deletedAt: new Date() })
      .where(eq(solicitudesRecursos.lote, loteId))
      .execute();

    return { success: true };
  }
};