import { fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import {
  inventarios,
  movimientos,
  detallesRecursos,
  personas,
  entidades,
  recursos,
  categoriaRecurso

} from "$lib/server/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export const load = async ({ locals }) => {

  if (!locals.user) {
    return { 
      recursos: Promise.resolve([]), 
      inventario: Promise.resolve([]) 
    };
  }

  const inventarioActualPromise = db
    .select({
      inventarioId: inventarios.id,
      recursoId: recursos.id,
      nombre: recursos.nombre,
      categoria: recursos.categoria, 
      stockActual: inventarios.cantidad
    })
    .from(inventarios)
    .innerJoin(recursos, eq(inventarios.recursosId, recursos.id))
    .innerJoin(entidades, eq(inventarios.entidadId, entidades.id))
    .where(eq(entidades.encargadoId, locals.user.id));

  return {
    recursos: db.select().from(recursos).where(isNull(recursos.deletedAt)),
    categoriaRecurso: categoriaRecurso.enumValues,
    inventario: inventarioActualPromise
  };
};

export const actions = {
  verificarDonante: async ({ request }) => {
    const cedula = (await request.formData()).get("cedula")?.toString().trim();
    if (!cedula) return fail(400, { errorBuscar: "Debe ingresar una cédula." });

    const [persona] = await db
      .select()
      .from(personas)
      .where(eq(personas.cedula, cedula))
      .limit(1);
    if (!persona)
      return fail(404, {
        errorBuscar: "CÉDULA NO REGISTRADA",
        cedulaNoEncontrada: cedula,
      });

    return { donanteEncontrado: persona };
  },

registrarDonacionMasiva: async ({ request, locals }) => {
  if (!locals.user) return fail(401, { error: "No autorizado." });

  const data = await request.formData();
  const personaIdRecibida = data.get("personasId")?.toString(); 
  const itemsDonados = JSON.parse(data.get("items")?.toString() || "[]");

  if (!personaIdRecibida || itemsDonados.length === 0) {
    return fail(400, { error: "Datos de donación incompletos o corruptos." });
  }

  // Identificador único para el lote completo de esta donación
  const identificadorLote = crypto.randomUUID();

  try {
    await db.transaction(async (tx) => {
      // Obtener la entidad administrada por el usuario en sesión
      const [entidad] = await tx
        .select()
        .from(entidades)
        .where(eq(entidades.encargadoId, locals.user.id))
        .limit(1);
      
      if (!entidad) throw new Error("ENTIDAD_NOT_FOUND");

      for (const item of itemsDonados) {
        const cant = parseInt(item.cantidad, 10);
        if (isNaN(cant) || cant <= 0 || !item.recursoId) continue;

        // 1. REGISTRO DE DETALLES INDEPENDIENTES POR ITEM
        // Cada registro es único ya que puede variar en fecha, talla o estado de conservación
        const [det] = await tx
          .insert(detallesRecursos)
          .values({
            recursoId: item.recursoId,
            lote: identificadorLote,
            vencimiento: item.vencimiento ? new Date(item.vencimiento) : null,
            talla: item.talla ? item.talla.toUpperCase().trim() : null,
            genero: item.genero ? item.genero.toUpperCase() : null,
            estado: item.estado ? item.estado.toUpperCase() : null
          })
          .returning();

        // 2. CONTROL DE INVENTARIO GENERAL
        // Buscamos si ya existe inventario del recurso base para ese almacén
        let [stock] = await tx
          .select()
          .from(inventarios)
          .where(
            and(
              eq(inventarios.entidadId, entidad.id),
              eq(inventarios.recursosId, item.recursoId)
            )
          )
          .limit(1);

        let invId;
        if (stock) {
          invId = stock.id;
          await tx
            .update(inventarios)
            .set({ 
              cantidad: stock.cantidad + cant, 
              updatedAt: new Date() 
            })
            .where(eq(inventarios.id, invId));
        } else {
          const [nuevo] = await tx
            .insert(inventarios)
            .values({
              entidadId: entidad.id,
              recursosId: item.recursoId,
              cantidad: cant
            })
            .returning();
          invId = nuevo.id;
        }

        // 3. REGISTRO DEL MOVIMIENTO DE ENTRADA
        // Se vincula al ID detallado recién inyectado para la trazabilidad exacta
        await tx.insert(movimientos).values({
          usuarioId: locals.user.id,    
          inventarioId: invId,         
          personaId: personaIdRecibida, 
          detallesId: det.id,          
          recursosId: item.recursoId,   
          metodo: "DONACION",
          tipo: true, // Entrada                
          cantidad: cant,
          lote: identificadorLote
        });
      }
    });

    return { exito: true };

  } catch (err) {
    if (err.message === "ENTIDAD_NOT_FOUND") {
      return fail(404, { errorGuardar: "No posees un centro de acopio o entidad autorizada." });
    }
    console.error("CRITICAL_TX_ERROR:", err);
    return fail(500, { errorGuardar: "Error crítico al registrar la operación en la base de datos." });
  }
},

procesarRetiroMasivo: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "NO AUTENTICADO" });
    }

    const formData = await request.formData();
    const metodo = formData.get('metodo');
    const itemsRaw = formData.get('items');

    if (!metodo || !itemsRaw) {
      return fail(400, { error: "FORMULARIO INCOMPLETO" });
    }

    let items = [];
    try {
      items = JSON.parse(itemsRaw);
    } catch (e) {
      return fail(400, { error: "PAYLOAD DAÑADO" });
    }

    if (items.length === 0) {
      return fail(400, { error: "NINGÚN RECURSO SELECCIONADO" });
    }

    // Identificador único de lote para agrupar TODOS los ítems de esta transacción exacta
    const identificadorLote = crypto.randomUUID();

    try {
      // Uso de transacción para asegurar atomicidad total en el retiro masivo
      await db.transaction(async (tx) => {
        for (const item of items) {
          const cantidadRetiro = parseInt(item.cantidad, 10);
          if (isNaN(cantidadRetiro) || cantidadRetiro <= 0) continue;

          // 1. RESOLVER DETALLES_ID: Buscar el id real para no romper el NOT NULL de movimientos
          let [det] = await tx
            .select()
            .from(detallesRecursos)
            .where(eq(detallesRecursos.recursoId, item.recursoId))
            .limit(1);

          if (!det) {
            [det] = await tx
              .insert(detallesRecursos)
              .values({ recursoId: item.recursoId })
              .returning();
          }

          // 2. INVENTARIO: Reducción atómica y segura del stock disponible
          await tx
            .update(inventarios)
            .set({
              cantidad: sql`${inventarios.cantidad} - ${cantidadRetiro}`,
              updatedAt: new Date()
            })
            .where(eq(inventarios.id, item.inventarioId));

          // 3. HISTORIAL: Inserción de la fila de movimiento vinculando el lote dinámico unificado
          await tx.insert(movimientos).values({
            usuarioId: locals.user.id,
            inventarioId: item.inventarioId,
            recursosId: item.recursoId,
            detallesId: det.id, // Clave foránea válida resuelta
            metodo: metodo,
            tipo: false, // false indica egreso / salida de stock
            cantidad: cantidadRetiro,
            lote: identificadorLote, // Todos los elementos de este clic comparten este UUID
            descripcion: `Retiro masivo asentado desde módulo de acopio.`
          });
        }
      });

      return { exito: "RETIRO DE INVENTARIO PROCESADO CORRECTAMENTE" };
    } catch (error) {
      console.error("RETIRO_TX_ERROR:", error);
      return fail(500, { error: "ERROR AL PROCESAR EL RETIRO EN BASE DE DATOS" });
    }
  }
};
