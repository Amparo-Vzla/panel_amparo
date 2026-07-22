import { db } from '$lib/server/db';
import { solicitudesRecursos, recursos, entidades, personal } from '$lib/server/db/schema';
import { eq, and, isNull, desc, or, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

// Definición de alias para las uniones de entidades
const entidadesRemitentes = alias(entidades, "entidades_remitentes");
const entidadesSolicitantes = alias(entidades, "entidades_solicitantes");

export function load({ locals }) {
  // Se asume que guardas el ID del usuario en locals.user (ajústalo según tu auth si varía)
  const usuarioId = locals.user?.id; 

  if (!usuarioId) {
    return { encomiendasDisponibles: Promise.resolve([]) };
  }

  // Subconsulta limpia: Obtiene los IDs de las entidades donde el usuario es personal activo
  const misEntidades = db
    .select({ id: personal.entidadId })
    .from(personal)
    .where(
      and(
        eq(personal.usuarioId, usuarioId),
        eq(personal.estatus, 'activo')
      )
    );

  return {
    encomiendasDisponibles: db
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
        
        origenCod: entidadesRemitentes.codigo,
        origenTipo: entidadesRemitentes.tipo,
        
        destinoCod: entidadesSolicitantes.codigo,
        destinoTipo: entidadesSolicitantes.tipo
      })
      .from(solicitudesRecursos)
      .innerJoin(recursos, eq(solicitudesRecursos.recursoId, recursos.id))
      .innerJoin(entidadesRemitentes, eq(solicitudesRecursos.remitenteId, entidadesRemitentes.id))
      .innerJoin(entidadesSolicitantes, eq(solicitudesRecursos.solicitanteId, entidadesSolicitantes.id))
      .where(
        and(
          eq(solicitudesRecursos.estatus, 'EN PROCESO'),
          isNull(solicitudesRecursos.envioId),
          isNull(solicitudesRecursos.deletedAt),
          // CLÁUSULA DE SEGURIDAD: Solo ve el lote si su entidad es remitente o solicitante
          or(
            inArray(solicitudesRecursos.remitenteId, misEntidades),
            inArray(solicitudesRecursos.solicitanteId, misEntidades)
          )
        )
      )
      .orderBy(desc(solicitudesRecursos.createdAt))
      .execute() // Promesa directa al frontend sin bloquear el ciclo de carga
  };
}