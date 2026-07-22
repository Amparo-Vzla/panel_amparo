import { redirect } from "@sveltejs/kit";
import { jwtVerify } from "jose";
import { env } from "$env/dynamic/private";

const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET);

// Diccionario de reglas por módulo (/dashboard/[modulo])
const REGLAS_ACCESO = {
  administracion: (user) => user.rol === "ADMIN",
  acopio: (user) => user.rol === "ENCARGADO" && user.tipoEntidad === "ACOPIO",
  refugios: (user) => user.rol === "ENCARGADO" && user.tipoEntidad === "REFUGIO",
  salud: (user) => user.rol === "ENCARGADO" && user.tipoEntidad === "SALUD",
  rescate: (user) => user.rol === "ENCARGADO" && user.tipoEntidad === "RESCATE",
  transporte: (user) => Boolean(user.tieneVehiculo),
};

export async function handle({ event, resolve }) {
  const inicio = Date.now();
  const metodo = event.request.method;
  const ruta = event.url.pathname;

  const token = event.cookies.get("session_token");
  event.locals.user = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      event.locals.user = {
        id: String(payload.id),
        correo: String(payload.correo),
        rol: String(payload.rol).toUpperCase(),
        tieneVehiculo: Boolean(payload.tieneVehiculo),
        entidadId: payload.entidadId ? String(payload.entidadId) : null,
        tipoEntidad: payload.tipoEntidad
          ? String(payload.tipoEntidad).toUpperCase()
          : null,
      };
    } catch (err) {
      event.cookies.delete("session_token", { path: "/" });
    }
  }

  if (ruta.startsWith("/dashboard") && !event.locals.user) {
    throw redirect(303, "/");
  }

  if (ruta.startsWith("/dashboard")) {
    const segmentos = ruta.split("/").filter(Boolean); 
    const modulo = segmentos[1]; 
    const user = event.locals.user;

    if (modulo && REGLAS_ACCESO[modulo]) {
      if (!REGLAS_ACCESO[modulo](user)) {
        throw redirect(303, "/dashboard");
      }
    }
  }

  const response = await resolve(event);

  const duracion = Date.now() - inicio;
  const usuarioLogueado = event.locals.user
    ? ` ${event.locals.user.correo}`
    : "Anónimo";

  console.log(
    `[${metodo}] ${response.status} | ${ruta} | ${duracion}ms | ${usuarioLogueado}`,
  );

  return response;
}
