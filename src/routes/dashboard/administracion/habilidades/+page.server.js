import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { profesiones, talentos, areasColaboracion, puestos } from '$lib/server/db/schema';

// --- CONTROLADOR DE CARGA (PROMESAS DIRECTAS SIN AWAIT) ---
export const load = async ({ locals }) => {
    if (!locals.user || locals.user.rol !== 'ADMIN') throw redirect(302, '/login');

    return {
        profesiones: db.select().from(profesiones),
        talentos: db.select().from(talentos),
        areasColaboracion: db.select().from(areasColaboracion),
        puestos: db.select().from(puestos)
    };
};

// --- ACCIONES DE FORMULARIO (MUTACIONES) ---
export const actions = {
    crearItem: async ({ request, locals }) => {
        if (!locals.user || locals.user.rol !== 'ADMIN') {
            return fail(401, { error: 'No autorizado para ejecutar esta acción central.' });
        }

        const data = await request.formData();
        const tipo = data.get('tipoCat')?.toString(); 
        const nombre = data.get('nombre')?.toString().trim().toUpperCase();
        const descripcion = data.get('descripcion')?.toString().trim(); 

        if (!tipo || !nombre) {
            return fail(400, { error: 'El tipo de catálogo y el nombre son estrictamente obligatorios.' });
        }

        try {
            // Se omitió la asignación de ID manual con crypto. El esquema/DB gestiona el UUID nativamente.
            if (tipo === 'PROFESION') {
                await db.insert(profesiones).values({ nombre });
            } else if (tipo === 'TALENTO') {
                await db.insert(talentos).values({ nombre });
            } else if (tipo === 'AREA') {
                await db.insert(areasColaboracion).values({ nombre, descripcion: descripcion || null });
            } else if (tipo === 'PUESTO') {
                await db.insert(puestos).values({ nombre });
            } else {
                return fail(400, { error: 'Tipo de catálogo inválido.' });
            }

            return { exito: 'Elemento integrado al catálogo operacional correctamente.' };
        } catch (err) {
            console.error("Fallo en inserción de catálogo administrativo:", err);
            if (err.message?.includes('unique') || err.message?.includes('already exists')) {
                return fail(400, { error: 'Conflicto: Este registro ya existe en el sistema.' });
            }
            return fail(500, { error: 'Error interno en la infraestructura: ' + err.message });
        }
    }
};