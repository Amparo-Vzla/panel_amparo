import { fail, redirect } from "@sveltejs/kit";
import { superValidate, message, setError } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import { usuarios, entidades } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { env } from "$env/dynamic/private";
import { hashPassword } from "$lib/server/crypto";
import { loginSchema } from "$lib/schemas/auth"; 

const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET);

export const load = async () => {
  const form = await superValidate(zod4(loginSchema));
  return { form };
};

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { correo, password } = form.data;

    let usuario;
    try {
      const resultado = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.correo, correo))
        .limit(1);
      usuario = resultado[0];
    } catch (error) {
      console.error("ERROR EN BASE DE DATOS:", error);
      return message(form, "Error de conexión con la base de datos.", { status: 500 });
    }

    if (!usuario) {
      return setError(form, "correo", "Credenciales inválidas.");
    }

    const securePassword = await hashPassword(password);
    if (usuario.password !== securePassword) {
      return setError(form, "password", "Credenciales inválidas.");
    }

    let entidadId = null;
    let tipoEntidad = null;

    try {
      const entidadAsignada = await db
        .select({ id: entidades.id, tipo: entidades.tipo })
        .from(entidades)
        .where(eq(entidades.encargadoId, usuario.id))
        .limit(1);

      if (entidadAsignada[0]) {
        entidadId = entidadAsignada[0].id;
        tipoEntidad = entidadAsignada[0].tipo;
      }
    } catch (error) {
      return message(form, "Error al procesar los permisos del usuario.", { status: 500 });
    }

    const payloadToken = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      cedula: usuario.cedula,
      telefono: usuario.telefono,
      entidadId,
      tipoEntidad,
    };

    const token = await new SignJWT(payloadToken)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("4h")
      .sign(SECRET_KEY);

    cookies.set("session_token", token, {
      path: "/",
      httpOnly: true,
      secure: !dev,
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
    });

    throw redirect(303, "/dashboard");
  },
};