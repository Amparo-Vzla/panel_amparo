import { pgEnum } from "drizzle-orm/pg-core";

export const estatusProceso = pgEnum("estatusproceso", [
  "PENDIENTE",
  "EN PROCESO",
  "APROBADO",
  "RECHAZADO",
  "FINZALIZADO",
  "CANCELADO",
]);

export const estatusPersona = pgEnum("estatuspersona", [
  "BIEN",
  "HERIDO",
  "REFUGIADO",
  "DESAPARECIDO",
  "ENCONTRADO",
]);

export const estatusEntidad = pgEnum("estatusentidad", [
  "ACTIVO",
  "INACTIVO",
  "SUSPENDIDO",
  "RECIBIENDO",
  "CERRADO",
]);

export const categoriaRecurso = pgEnum("categoriarecurso", [
  "OTROS",
  "MEDICAMENTO",
  "HERRAMIENTAS",
  "ALIMENTOS",
  "VESTIMENTA",
  "JUGUETES",
  "HIGIENE",
  "LOGISTICA",
]);

export const categoriaServicios = pgEnum("categoriaservicios", [
  "OTROS",
  "SALUD",
  "TRANSPORTE",
  "ENTRETENIMIENTO",
  "SALUD MENTAL",
]);

export const categoriaDenuncia = pgEnum("categoriaDenuncia", [
  "SERVICIOS PUBLICOS",
  "INFRAESTRCUTURA",
  "DESVIO DE RECURSOS",
  "ABUSO DE AUTORIDAD",
  "SALUD PUBLICA",
  "LOGISTICA",
  "OTROS",
]);

export const categoriaReportes = pgEnum("categoriaReportes", [
  "PLATAFORMA",
  "NOTICIAS",
  "SEGURIDAD",
  "SUGERENCIA",
  "TERRENO",
  "EMERGENCIA",
  "TESTIMONIO",
  "OTROS",
]);

export const tiposTransporte = pgEnum("tipostransporte", [
  "CAMION",
  "MOTO",
  "CARRO",
  "AVION",
  "GANDOLA",
  "AUTOBUS",
]);

export const roles = pgEnum("roles", [
  "ADMIN",
  "SUPERVISOR",
  "VOLUNTARIO",
  "DAMNIFICADO",
  "ENCARGADO",
]);

export const tipoEntidad = pgEnum("tipoentidad", [
  "ACOPIO",
  "SALUD",
  "RESCATE",
  "TRANSPORTE",
  "ENTRETENIMIENTO",
  "INFANTIL",
  "PSICOLOGICO",
]);

export const metodoMovimiento = pgEnum("metodoMovimiento", [
  "DONACION",
  "CONSUMO",
  "VENCIMIENTO",
  "ROBO",
  "MAL ESTADO"
]);