import { db } from '$lib/server/db';
import { solicitudesRecursos, recursos, entidades } from '$lib/server/db/schema';
import { eq, and, isNull, desc, aliasedTable } from 'drizzle-orm';

const entidadesSolicitantes = aliasedTable(entidades, "entidades_solicitantes");

export function load({ locals }) {
  const miEntidadId = locals.user?.entidadId || null;

  return {
    miEntidadId,
    solicitudesPorDespachar: db
      .select({
        id: solicitudesRecursos.id,
        lote: solicitudesRecursos.lote,
        estatus: solicitudesRecursos.estatus,
        cantidad: solicitudesRecursos.cantidad,
        descripcion: solicitudesRecursos.descripcion,
        createdAt: solicitudesRecursos.createdAt,
        recursoNombre: recursos.nombre,
        recursoCategoria: recursos.categoria, 
        solicitanteCod: entidadesSolicitantes.codigo, 
        solicitanteTipo: entidadesSolicitantes.tipo,
        solicitanteId: solicitudesRecursos.solicitanteId
      })
      .from(solicitudesRecursos)
      .innerJoin(recursos, eq(solicitudesRecursos.recursoId, recursos.id))
      .innerJoin(entidadesSolicitantes, eq(solicitudesRecursos.solicitanteId, entidadesSolicitantes.id))
      .where(
        and(
          eq(solicitudesRecursos.remitenteId, miEntidadId),
          eq(solicitudesRecursos.estatus, 'EN PROCESO'),
          isNull(solicitudesRecursos.envioId),
          isNull(solicitudesRecursos.deletedAt)
        )
      )
      .orderBy(desc(solicitudesRecursos.createdAt))
      .execute()
  };
}