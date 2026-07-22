import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { recursos, categoriaRecurso  } from '$lib/server/db/schema';
import { eq, ilike, or, and, count, sql } from 'drizzle-orm';

export const load = ({ locals, url }) => {
    if (!locals.user) throw redirect(302, '/login');

    const buscar = url.searchParams.get('q')?.trim() || '';
    const pagina = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limite = 10;
    const offset = (pagina - 1) * limite;

    const condiciones = [];
    if (buscar) {
        condiciones.push(
            or(
                ilike(recursos.nombre, `%${buscar}%`),
                ilike(recursos.categoria, `%${buscar}%`),
                ilike(recursos.descripcion, `%${buscar}%`)
            )
        );
    }

    const filtroFinal = condiciones.length > 0 ? and(...condiciones) : undefined;

    // 1. Promesa: Obtener lista paginada de recursos (Sin await para Streaming)
    const listaRecursosPromise = db.select()
        .from(recursos)
        .where(filtroFinal)
        .limit(10)
        .offset(offset)
        .orderBy(recursos.nombre);

    // 2. Promesa: Contar el total de registros bajo el filtro para calcular paginación
    const totalRegistrosPromise = db.select({ total: count() })
        .from(recursos)
        .where(filtroFinal)
        .then(r => r[0]?.total || 0);

    return {
        buscar,
        pagina,
        limite,
        streamed: {
            recursos: listaRecursosPromise,
            total: totalRegistrosPromise,
        
        },
        categoriaRecurso: categoriaRecurso.enumValues
    };
};

export const actions = {
    crearRecurso: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { error: 'No autorizado.' });

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString().trim().toUpperCase();
        const categoria = data.get('categoria')?.toString();
        const descripcion = data.get('descripcion')?.toString().trim() || null;

        if (!nombre || !categoria) {
            return fail(400, { error: 'El nombre y la categoría son campos mandatorios.' });
        }

        try {
            await db.insert(recursos).values({
                nombre,
                categoria,
                descripcion
            });

            return { exito: 'Ítem agregado correctamente al catálogo maestro.' };
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Error interno al registrar el recurso.' });
        }
    }
};