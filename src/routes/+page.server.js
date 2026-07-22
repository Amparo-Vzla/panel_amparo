// src/routes/login/+page.server.js
import { fail, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment"; // <-- Control de entorno para cookies
import { db } from "$lib/server/db";
import { usuarios, vehiculos, entidades } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { env } from "$env/dynamic/private";
import { hashPassword } from "$lib/server/crypto";

const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET);

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const correo = data.get("correo")?.toString().trim();
    const password = data.get("password")?.toString();

    if (!correo || !password) {
      return fail(400, { error: "Todos los campos son requeridos." });
    }

    let usuario;
    try {
      const resultado = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.correo, correo))
        .limit(1);
      usuario = resultado[0];
    } catch (error) {
      console.error(
        "ERROR EN BASE DE DATOS AL BUSCAR USUARIO:",
        error.message || error,
      );
      return fail(500, { error: "Error de conexión con la base de datos." });
    }

    if (!usuario) {
      return fail(400, { error: "Credenciales inválidas." });
    }

    const securePassword = await hashPassword(password);
    if (usuario.password !== securePassword) {
      return fail(400, { error: "Credenciales inválidas." });
    }

    let tieneVehiculo = false;
    let entidadId = null;
    let tipoEntidad = null;

    try {
      const vehiculoUsuario = await db
        .select({ id: vehiculos.id })
        .from(vehiculos)
        .where(eq(vehiculos.usuarioId, usuario.id))
        .limit(1);

      tieneVehiculo = vehiculoUsuario.length > 0;

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
      console.error(
        "ERROR AL CARGAR METADATOS DE SEGURIDAD:",
        error.message || error,
      );
      return fail(500, {
        error: "Error al procesar los permisos del usuario.",
      });
    }

// ... código anterior (validaciones y consultas db) ...

    const payloadToken = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      cedula: usuario.cedula,
      telefono: usuario.telefono,
      tieneVehiculo,
      entidadId,
      tipoEntidad,
    };

    // IMPRESIÓN DE DEPURACIÓN AQUÍ
    console.log("=== DATOS A GUARDAR EN EL TOKEN ===", payloadToken);

    const token = await new SignJWT(payloadToken)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("4h")
      .sign(SECRET_KEY);

// ... resto del código (cookies.set y redirect) ...

    cookies.set("session_token", token, {
      path: "/",
      httpOnly: true,
      secure: !dev, // <-- CAMBIO CLAVE: Falso en localhost/IP, verdadero en producción
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
    });

    throw redirect(303, "/dashboard");
  },
};
