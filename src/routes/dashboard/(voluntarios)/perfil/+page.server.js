import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import {
  usuarios,
  personas,
  talentos,
  areasColaboracion,
  profesiones,
  estatusPersona,
  estatusEntidad,
  tiposTransporte,
  entidades,
  personal,
  vehiculos,
} from "$lib/server/db/schema";
import { hashPassword } from "$lib/server/crypto";
import { eq, and, isNull } from "drizzle-orm";

export const load = ({ locals }) => {
  if (!locals.user || !locals.user.id) throw redirect(302, "/login");
  const usuarioId = locals.user.id;

  const perfilPromise = db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId))
    .limit(1)
    .then((r) => {
      if (!r[0]) throw redirect(302, "/login");
      return r[0];
    });

  const personaAsociadaPromise = perfilPromise.then((perfil) => {
    if (!perfil.cedula) return null;
    return db
      .select()
      .from(personas)
      .where(eq(personas.cedula, perfil.cedula))
      .limit(1)
      .then((r) => r[0] || null);
  });

  // 1. Entidad que coordina directamente el usuario actual (COMO ENCARGADO)
  const entidadEncargadoPromise = db
    .select()
    .from(entidades)
    .where(
      and(eq(entidades.encargadoId, usuarioId), isNull(entidades.deletedAt)),
    )
    .limit(1)
    .then((r) => r[0] || null);

  // 2. Membresía operativa (COMO PERSONAL) - Extracción total de campos de la entidad
  const dePersonalPromise = db
    .select({
      id: personal.id,
      rol: personal.rol,
      estatusPersonal: personal.estatus,
      // Mapeo absoluto del esquema de la entidad para el personal asignado
      entidadId: entidades.id,
      codigo: entidades.codigo,
      encargadoId: entidades.encargadoId,
      tipo: entidades.tipo,
      nombre: entidades.nombre,
      telefonoPrincipal: entidades.telefonoPrincipal,
      telefonoSecundario: entidades.telefonoSecundario,
      emailContacto: entidades.emailContacto,
      estado: entidades.estado,
      municipio: entidades.municipio,
      localidad: entidades.localidad,
      direccionExacta: entidades.direccionExacta,
      latitud: entidades.latitud,
      longitud: entidades.longitud,
      verificado: entidades.verificado,
      estatusEntidad: entidades.estatus,
    })
    .from(personal)
    .innerJoin(entidades, eq(personal.entidadId, entidades.id))
    .where(and(eq(personal.usuarioId, usuarioId), isNull(entidades.deletedAt)))
    .limit(1)
    .then((r) => r[0] || null);

  const listProfesionesPromise = db.select().from(profesiones);
  const listTalentosPromise = db.select().from(talentos);
  const listAreasPromise = db.select().from(areasColaboracion);
  const vehiculoPromise = db
    .select()
    .from(vehiculos)
    .where(eq(vehiculos.usuarioId, usuarioId))
    .limit(1)
    .then((r) => r[0] || null);

  return {
    perfil: perfilPromise,
    personaAsociada: personaAsociadaPromise,
    entidadEncargado: entidadEncargadoPromise,
    dePersonal: dePersonalPromise,
    profesiones: listProfesionesPromise,
    talentos: listTalentosPromise,
    areasColaboracion: listAreasPromise,
    estatusPersona: estatusPersona.enumValues,
    estatusEntidad: estatusEntidad.enumValues,
    vehiculo: vehiculoPromise,
    tiposTransporte: tiposTransporte.enumValues,
  };
};

export const actions = {
  actualizarDatos: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const nombre = data.get("nombre")?.toString().trim().toUpperCase();
    const apellido = data.get("apellido")?.toString().trim().toUpperCase();
    const tipoSangre = data.get("tipoSangre")?.toString();

    const telefono = data.get("telefono")?.toString();
    const profesionId = data.get("profesionId")?.toString() || null;
    const disponibilidad = data.get("disponibilidad")?.toString() || null;

    const talentosIds = data.getAll("talentosIds").slice(0, 4);
    const areasIds = data.getAll("areasIds").slice(0, 4);

    if (!nombre || !apellido) {
      return fail(400, {
        error: "Nombre, Apellido son campos obligatorios.",
      });
    }

    try {
      await db
        .update(usuarios)
        .set({
          nombre,
          apellido,
          tipoSangre,
          telefono,
          profesionId,
          disponibilidad,
          talento1: talentosIds[0] || null,
          talento2: talentosIds[1] || null,
          talento3: talentosIds[2] || null,
          talento4: talentosIds[3] || null,
          colaboracion1: areasIds[0] || null,
          colaboracion2: areasIds[1] || null,
          colaboracion3: areasIds[2] || null,
          colaboracion4: areasIds[3] || null,
          updatedAt: new Date(),
        })
        .where(eq(usuarios.id, locals.user.id));

      return {
        exito: "Perfil y capacidades operativas actualizadas con éxito.",
      };
    } catch (err) {
      return fail(500, {
        error: "Fallo crítico al registrar cambios en base de datos.",
      });
    }
  },

  sincronizarCenso: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const estatusPersona = data.get("estatusPersona")?.toString();
    const estado = data.get("estado")?.toString();
    const municipio = data.get("municipio")?.toString();
    const localidad = data.get("localidad")?.toString();
    const caracteristicas = data.get("caracteristicas")?.toString();
    const direccionExacta = data.get("direccionExacta")?.toString();

    if (!estado || !municipio || !localidad || !direccionExacta) {
      return fail(400, {
        error:
          "La ubicación exacta y parroquia son requeridas para la localización.",
      });
    }

    try {
      const perfil = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, locals.user.id))
        .limit(1)
        .then((r) => r[0]);
      const existe = await db
        .select()
        .from(personas)
        .where(eq(personas.cedula, perfil.cedula))
        .limit(1)
        .then((r) => r[0]);

      if (existe) {
        await db
          .update(personas)
          .set({
            estatus: estatusPersona || "BIEN",
            estado,
            municipio,
            localidad,
            direccionExacta,
            tipoSangre: perfil.tipoSangre,
            updatedAt: new Date(),
          })
          .where(eq(personas.id, existe.id));
      } else {
        const [nuevaPersona] = await db
          .insert(personas)
          .values({
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            cedula: perfil.cedula,
            genero: perfil.genero || "N/A",
            telefono: perfil.telefono || "N/A",
            fechaNacimiento: perfil.fechaNacimiento || new Date(),
            caracteristicas,
            estado,
            municipio,
            localidad,
            direccionExacta,
            tipoSangre: perfil.tipoSangre || "O+",
            estatus: estatusPersona || "BIEN",
          })
          .returning();

        await db
          .update(usuarios)
          .set({ personaId: nuevaPersona.id })
          .where(eq(usuarios.id, locals.user.id));
      }

      return {
        exito: "Datos sincronizados de forma correcta en el Censo Nacional.",
      };
    } catch (err) {
      return fail(500, {
        error:
          "Error interno al procesar los datos de localización geográfica.",
      });
    }
  },

  cambiarClave: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const nuevaClave = data.get("nuevaClave")?.toString();

    if (!nuevaClave || nuevaClave.length < 6) {
      return fail(400, {
        error: "La clave de resguardo debe poseer un mínimo de 6 caracteres.",
      });
    }

    try {
      const nuevaClaveHash = await hashPassword(nuevaClave);
      await db
        .update(usuarios)
        .set({ password: nuevaClaveHash, updatedAt: new Date() })
        .where(eq(usuarios.id, locals.user.id));

      return { exito: "Credenciales de acceso actualizadas con éxito." };
    } catch (err) {
      return fail(500, {
        error: "Fallo al encriptar o actualizar clave de seguridad.",
      });
    }
  },

  actualizarEstatusEntidad: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const entidadId = data.get("entidadId")?.toString();
    const nuevoEstatus = data.get("estatus")?.toString();

    if (!entidadId || !nuevoEstatus) {
      return fail(400, { error: "Parámetros insuficientes." });
    }

    try {
      // Verificación estricta: Solo el encargado registrado puede alterar el estatus operacional
      const resultado = await db
        .update(entidades)
        .set({
          estatus: nuevoEstatus,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(entidades.id, entidadId),
            eq(entidades.encargadoId, locals.user.id),
          ),
        );

      return { exito: "Estatus de la entidad actualizado en tiempo real." };
    } catch (err) {
      return fail(500, { error: "Fallo de escritura en red operativa." });
    }
  },

  finalizarServicio: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "No autorizado." });

    const data = await request.formData();
    const personalId = data.get("personalId")?.toString();

    if (!personalId) {
      return fail(400, { error: "Identificador de personal ausente." });
    }

    try {
      // Verificación estricta: Solo el propio usuario puede rescindir de su asignación de personal
      await db
        .delete(personal)
        .where(
          and(
            eq(personal.id, personalId),
            eq(personal.usuarioId, locals.user.id),
          ),
        );
      return { exito: "Baja de la membresía operativa ejecutada con éxito." };
    } catch (err) {
      return fail(500, {
        error: "Error interno al procesar la renuncia voluntaria.",
      });
    }
  },

  guardarVehiculo: async ({ request, locals }) => {
  if (!locals.user) return fail(401, { error: "No autorizado." });

  const data = await request.formData();
  const placa = data.get("placa")?.toString().trim().toUpperCase();
  const tipo = data.get("tipo")?.toString();
  const marca = data.get("marca")?.toString().trim().toUpperCase();
  const modelo = data.get("modelo")?.toString().trim().toUpperCase();
  const color = data.get("color")?.toString().trim().toUpperCase();

  if (!placa || !tipo || !marca || !modelo || !color) {
    return fail(400, { error: "Todos los campos de identificación vehicular son necesarios." });
  }

  try {
    const existe = await db
      .select()
      .from(vehiculos)
      .where(eq(vehiculos.usuarioId, locals.user.id))
      .limit(1)
      .then((r) => r[0]);

    if (existe) {
      await db
        .update(vehiculos)
        .set({ placa, tipo, marca, modelo, color, updatedAt: new Date() })
        .where(eq(vehiculos.id, existe.id));
    } else {
      await db.insert(vehiculos).values({
        usuarioId: locals.user.id,
        placa,
        tipo,
        marca,
        modelo,
        color,
      });
    }

    return { exito: "Unidad vehicular actualizada correctamente" };
  } catch (err) {
    return fail(500, { error: "Fallo interno de red." });
  };
},
}
