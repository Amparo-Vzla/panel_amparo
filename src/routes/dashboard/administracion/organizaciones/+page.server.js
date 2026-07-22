import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { entidades, usuarios, reportes } from '$lib/server/db/schema';
import { eq, isNull, desc } from 'drizzle-orm';

export const load = ({ locals }) => {
    if (!locals.user || locals.user.rol !== 'ADMIN') {
        throw redirect(302, '/dashboard');
    }

    // Promesa de entidades: Corregidas las referencias a 'encargadoId'
    const entidadesPromise = db
        .select({
            id: entidades.id,
            codigo: entidades.codigo,
            nombre: entidades.nombre,
            tipo: entidades.tipo,
            telefonoPrincipal: entidades.telefonoPrincipal,
            emailContacto: entidades.emailContacto,
            estado: entidades.estado,
            municipio: entidades.municipio,
            localidad: entidades.localidad,
            direccionExacta: entidades.direccionExacta,
            verificado: entidades.verificado,
            estatus: entidades.estatus,
            createdAt: entidades.createdAt,
            creadorNombre: usuarios.nombre,
            creadorApellido: usuarios.apellido,
            encargadoId: entidades.encargadoId
        })
        .from(entidades)
        .innerJoin(usuarios, eq(entidades.encargadoId, usuarios.id))
        .where(isNull(entidades.deletedAt))
        .orderBy(desc(entidades.createdAt));

    // Promesa de reportes
    const reportesPromise = db
        .select({
            id: reportes.id,
            descripcion: reportes.descripcion,
            createdAt: reportes.createdAt,
            creadorNombre: usuarios.nombre,
            creadorApellido: usuarios.apellido
        })
        .from(reportes)
        .leftJoin(usuarios, eq(reportes.usuarioId, usuarios.id))
        .orderBy(desc(reportes.createdAt));

    // Retorno directo sin await para habilitar streaming limpio
    return {
        streamed: {
            entidades: entidadesPromise,
            reportes: reportesPromise
        }
    };
};

export const actions = {
    verificar: async ({ request, locals }) => {
        if (!locals.user || locals.user.rol !== 'ADMIN') return fail(401, { error: 'No autorizado' });
        const data = await request.formData();
        const id = data.get('id')?.toString();
        
        const [entidad] = await db.select().from(entidades).where(eq(entidades.id, id));
        if (!entidad) return fail(404, { error: 'Entidad no encontrada.' });
        
        await db.update(usuarios).set({ rol: 'ENCARGADO' }).where(eq(usuarios.id, entidad.encargadoId));
        await db.update(entidades).set({ verificado: true, updatedAt: new Date() }).where(eq(entidades.id, id));
        
        return { exito: 'Verificación exitosa.' };
    },

    rechazar: async ({ request, locals }) => {
        if (!locals.user || locals.user.rol !== 'ADMIN') return fail(401, { error: 'No autorizado' });
        const data = await request.formData();
        const id = data.get('id')?.toString();
        
        await db.delete(entidades).where(eq(entidades.id, id));
        return { exito: 'Entidad eliminada.' };
    }
};