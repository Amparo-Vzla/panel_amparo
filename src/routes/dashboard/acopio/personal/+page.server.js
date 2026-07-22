import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { personal, usuarios, entidades, vacantes, profesiones, areasColaboracion, puestos } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// --- CONTROLADOR DE CARGA (STREAMING DIRECTO) ---
export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    // Promesa 1: Personal asignado actualmente a la Sede
    const personalPromise = db
        .select({
            id: personal.id,
            rol: personal.rol,
            estatus: personal.estatus,
            createdAt: personal.createdAt,
            usuario: {
                id: usuarios.id,
                nombre: usuarios.nombre,
                apellido: usuarios.apellido,
                cedula: usuarios.cedula,
                genero: usuarios.genero,
                correo: usuarios.correo,
                telefono: usuarios.telefono,
                tipoSangre: usuarios.tipoSangre,
                disponibilidad: usuarios.disponibilidad,
                profesion: profesiones.nombre,
                puesto: puestos.nombre
            }
        })
        .from(personal)
        .innerJoin(entidades, eq(personal.entidadId, entidades.id))
        .innerJoin(usuarios, eq(personal.usuarioId, usuarios.id))
        .leftJoin(profesiones, eq(usuarios.profesionId, profesiones.id))
        .leftJoin(puestos, eq(personal.puestoId, puestos.id))
        .where(eq(entidades.encargadoId, locals.user.id));

    // Promesa 2: Registro de Vacantes / Postulaciones Civiles
    const vacantesPromise = db
        .select({
            id: vacantes.id,
            codigo: vacantes.codigo,
            tipo: vacantes.tipo, 
            estatus: vacantes.estatus,
            descripcion: vacantes.descripcion,
            profesionRequerida: profesiones.nombre,
            areaRequerida: areasColaboracion.nombre,
            puestoRequerido: puestos.nombre,
            createdAt: vacantes.createdAt
        })
        .from(vacantes)
        .innerJoin(entidades, eq(vacantes.entidadId, entidades.id))
        .leftJoin(profesiones, eq(vacantes.profesionId, profesiones.id))
        .leftJoin(areasColaboracion, eq(vacantes.areaColaboracionId, areasColaboracion.id))
        .leftJoin(puestos, eq(vacantes.puestoId, puestos.id))
        .where(and(eq(entidades.encargadoId, locals.user.id), isNull(vacantes.deletedAt)));

    // Promesas 3, 4 y 5: Tablas de catálogo para formularios
    const catProfesionesPromise = db.select().from(profesiones);
    const catAreasPromise = db.select().from(areasColaboracion);
    const catPuestosPromise = db.select().from(puestos);

    return {
        streamed: {
            personal: personalPromise,
            vacantes: vacantesPromise,
            catalogoProfesiones: catProfesionesPromise,
            catalogoAreas: catAreasPromise,
            catalogoPuestos: catPuestosPromise
        }
    };
};

// --- ACCIONES DE FORMULARIO (MUTACIONES) ---
export const actions = {
    crearVacante: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { error: 'No autorizado' });

        // Identificar la entidad asignada al encargado actual
        const [entidad] = await db
            .select({ id: entidades.id })
            .from(entidades)
            .where(eq(entidades.encargadoId, locals.user.id))
            .limit(1);

        if (!entidad) return fail(404, { error: 'No posees una entidad bajo tu cargo.' });

        // Extracción e higienización de datos del formulario
        const data = await request.formData();
        const descripcion = data.get('descripcion')?.toString();
        const profesionId = data.get('profesionId')?.toString() || null;
        const areaColaboracionId = data.get('areaColaboracionId')?.toString() || null;
        const puestoId = data.get('puestoId')?.toString() || null;

        if (!descripcion) return fail(400, { error: 'La descripción es obligatoria.' });

        try {
            await db.insert(vacantes).values({
                codigo: `REQ-${Date.now().toString().slice(-6)}`,
                tipo: 'VACANTE', 
                descripcion,
                profesionId: profesionId === "" ? null : profesionId,
                areaColaboracionId: areaColaboracionId === "" ? null : areaColaboracionId,
                puestoId: puestoId === "" ? null : puestoId,
                usuarioCreadorId: locals.user.id,
                entidadId: entidad.id,
                estatus: 'ABIERTA'
            });

            return { exito: 'Vacante unitaria publicada en cartelera civil.' };
        } catch (e) {
            console.error(e);
            return fail(500, { error: 'Fallo logístico al registrar la vacante.' });
        }
    },

    gestionarPersonal: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id')?.toString();
        const accion = data.get('accion')?.toString();

        if (!id || !accion) return fail(400, { error: 'Identificadores ausentes.' });

        const nuevoEstatus = accion === 'aceptar' ? 'activo' : accion === 'rechazar' ? 'rechazado' : 'inactivo';

        try {
            await db.update(personal)
                .set({ estatus: nuevoEstatus, updatedAt: new Date() })
                .where(eq(personal.id, id));

            return { exito: `Ficha de personal modificada a: ${nuevoEstatus}` };
        } catch (e) {
            return fail(500, { error: 'Error al alterar el estatus de personal.' });
        }
    },

    gestionarPostulacion: async ({ request }) => {
        const data = await request.formData();
        const vacanteId = data.get('vacanteId')?.toString();
        const accion = data.get('accion')?.toString(); 

        if (!vacanteId || !accion) return fail(400, { error: 'Parámetros insuficientes.' });

        const nuevoEstatus = accion === 'aceptar' ? 'ACEPTADA' : 'RECHAZADA';

        try {
            await db.update(vacantes)
                .set({ estatus: nuevoEstatus, updatedAt: new Date() })
                .where(eq(vacantes.id, vacanteId));

            return { exito: `Postulación voluntaria individual ${accion === 'aceptar' ? 'admitida' : 'declinada'}.` };
        } catch (e) {
            return fail(500, { error: 'Error al mitigar el estatus de la postulación.' });
        }
    },

    cerrarVacante: async ({ request }) => {
        const data = await request.formData();
        const vacanteId = data.get('vacanteId')?.toString();

        if (!vacanteId) return fail(400, { error: 'ID de vacante ausente.' });

        try {
            await db.update(vacantes)
                .set({ estatus: 'CERRADA', updatedAt: new Date() })
                .where(eq(vacantes.id, vacanteId));

            return { exito: 'Vacante clausurada correctamente.' };
        } catch (e) {
            return fail(500, { error: 'No se pudo cerrar la vacante.' });
        }
    }
};