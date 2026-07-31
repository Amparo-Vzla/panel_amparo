import { z } from "zod";

export const registroSchema = z.object({
	nombre: z.string().min(1, "El nombre es obligatorio"),
	apellido: z.string().min(1, "El apellido es obligatorio"),
	nacionalidad: z.enum(["V", "E"]),
	cedula: z.string().min(7, "Cédula inválida"),
	codigo: z.enum(["0412", "0422", "0414", "0424", "0416", "0426"]),
	telefono: z.string().min(7, "Teléfono incompleto"),
	genero: z.string().min(1, "Seleccione género"),
	fechaNacimiento: z.string().min(1, "Fecha requerida"),
	correo: z.string().email("Correo inválido"),
	password: z.string().min(8, "Mínimo 8 caracteres"),
	verificar: z.string().min(8, "Mínimo 8 caracteres"),
	profesionId: z.coerce.number().optional().nullable(),
	disponibilidad: z.string().min(1, "Seleccione disponibilidad"),
	tipoSangre: z.string().min(1, "Seleccione tipo de sangre"),
	talentosIds: z.array(z.coerce.number()).default([]),
	areasIds: z.array(z.coerce.number()).default([])
}).refine((data) => data.password === data.verificar, {
	message: "Las contraseñas no coinciden",
	path: ["verificar"]
});

export const loginSchema = z.object({
	correo: z.string().trim().email("Correo inválido"),
  	password: z.string().min(8, "Mínimo 8 caracteres")
})