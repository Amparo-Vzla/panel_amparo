import { fail } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { profesiones, talentos, areasColaboracion, usuarios, personas,} from "$lib/server/db/schema";
import { hashPassword } from "$lib/server/crypto";
import { registroSchema } from "$lib/schemas/auth"; 

export const load = async () => {
  const form = await superValidate(zod4(registroSchema));
  return {
    form,
    profesiones: db.select().from(profesiones),
    talentos: db.select().from(talentos),
    areasColaboracion: db.select().from(areasColaboracion),
  };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(registroSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const b = form.data;
    const talentosIds = (b.talentosIds || []).slice(0, 4);
    const areasIds = (b.areasIds || []).slice(0, 4);

    try {
      const securePassword = await hashPassword(b.password);
      const cedulaLimpia = b.cedula.trim().toUpperCase();
      const telefono = b.codigo + b.telefono;

      const personaExistente = await db.query.personas.findFirst({
        where: eq(personas.cedula, cedulaLimpia),
      });

      let personaIdAsignada = null;

      if (personaExistente) {
        await db
          .update(personas)
          .set({
            nombre: b.nombre.toUpperCase(),
            apellido: b.apellido.toUpperCase(),
            genero: b.genero,
            tipoSangre: b.tipoSangre,
            telefono: telefono,
            fechaNacimiento: b.fechaNacimiento,
            estatus: "BIEN",
            updatedAt: new Date(),
          })
          .where(eq(personas.id, personaExistente.id));

        personaIdAsignada = personaExistente.id;
      }

      await db.insert(usuarios).values({
        personaId: personaIdAsignada,
        nombre: b.nombre.toUpperCase(),
        apellido: b.apellido.toUpperCase(),
        nacionalidad: b.nacionalidad,
        cedula: cedulaLimpia,
        telefono: telefono,
        correo: b.correo.toLowerCase(),
        rol: "VOLUNTARIO",
        password: securePassword,
        genero: b.genero,
        fechaNacimiento: b.fechaNacimiento,
        profesionId: b.profesionId || null,
        tipoSangre: b.tipoSangre,
        disponibilidad: b.disponibilidad,
        talento1: talentosIds[0] || null,
        talento2: talentosIds[1] || null,
        talento3: talentosIds[2] || null,
        talento4: talentosIds[3] || null,
        colaboracion1: areasIds[0] || null,
        colaboracion2: areasIds[1] || null,
        colaboracion3: areasIds[2] || null,
        colaboracion4: areasIds[3] || null,
      });

      return message(form, "Registro completado correctamente.");
    } catch (err) {
      console.error("Error en registro:", err);
      return fail(500, {
        form,
        error: "Error al procesar el registro. Verifique sus datos.",
      });
    }
  },
};