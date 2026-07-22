import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { vacantes, profesiones, areasColaboracion, puestos, entidades } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// --- CONTROLADOR DE CARGA (STREAMING CORREGIDO) ---
export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const vacantesDisponiblesPromise = db
        .select({
            id: vacantes.id,
            codigo: vacantes.codigo,
            tipo: vacantes.tipo, 
            estatus: vacantes.estatus,
            descripcion: vacantes.descripcion,
            profesionRequerida: profesiones.nombre,
            areaRequerida: areasColaboracion.nombre,
            puestoRequerido: puestos.nombre,
            entidadCodigo: entidades.codigo, // 🌟 CORREGIDO: de entidades.cod a entidades.codigo
            createdAt: vacantes.createdAt
        })
        .from(vacantes)
        .leftJoin(profesiones, eq(vacantes.profesionId, profesiones.id))
        .leftJoin(areasColaboracion, eq(vacantes.areaColaboracionId, areasColaboracion.id))
        .leftJoin(puestos, eq(vacantes.puestoId, puestos.id))
        .leftJoin(entidades, eq(vacantes.entidadId, entidades.id))
        .where(
            and(
                eq(vacantes.tipo, 'VACANTE'), // 🌟 Asegura la exclusión si muta a POSTULACION
                eq(vacantes.estatus, 'ABIERTA'),
                isNull(vacantes.deletedAt)
            )
        )
        .execute(); // 🌟 REAL: Genera una Promesa nativa para el data_serializer de SvelteKit

    return {
        streamed: {
            vacantes: vacantesDisponiblesPromise
        }
    };
};

export const actions = {
    postularse: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { error: 'No autorizado' });

        const data = await request.formData();
        const vacanteId = data.get('vacanteId')?.toString();

        if (!vacanteId) return fail(400, { error: 'Identificador de vacante ausente.' });

        try {
            // Al cambiar el tipo a 'POSTULACION', la consulta del load lo excluirá en la siguiente recarga reactiva
            await db.update(vacantes)
                .set({ 
                    tipo: 'POSTULACION',
                    updatedAt: new Date()
                })
                .where(eq(vacantes.id, vacanteId));

            return { exito: 'Te has postulado con éxito. El requerimiento se ha movido a tu bandeja privada.' };
        } catch (e) {
            console.error(e);
            return fail(500, { error: 'Fallo logístico al procesar postulación.' });
        }
    }
};