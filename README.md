# AMPAROVZLA

Plataforma para la gestión centralizada, coordinación y distribución de ayuda humanitaria. El sistema está estructurado como una aplicación web de alta densidad de información.

La arquitectura del software se basa en un flujo de datos lineal y no bloqueante. Desde el servidor se despachan promesas directas hacia el cliente sin detener la renderización de la página, permitiendo que la interfaz procese de forma asíncrona los bloques de información a medida que se resuelven. Visualmente, la plataforma descarta elementos decorativos redundantes, organizando los módulos en interfaces compactas.

---

## CONSTRUCCIÓN TÉCNICA

El sistema está desarrollado exclusivamente en JavaScript nativo, omitiendo el uso de TypeScript. La estructura de la aplicación y el enrutamiento se ejecutan sobre SvelteKit. La interfaz de usuario utiliza Svelte 5, gestionando todo el ciclo de vida y los filtros reactivos del cliente mediante el sistema nativo de runas.

El diseño visual y la distribución del espacio se implementan con Tailwind CSS, aplicando una paleta de colores neutrales y componentes densos sin contenedores aislados. La persistencia de datos se maneja sobre una base de datos PostgreSQL, utilizando Drizzle ORM como capa de mapeo y construcción de consultas estructuradas. Las mutaciones y el envío de formularios se procesan mediante la funcionalidad de mejora progresiva nativa del framework para actualizar el estado de la pantalla sin recargar la página.

---

## COMPONENTES DEL SISTEMA

La plataforma se divide en módulos independientes y acoplados al núcleo de identidades del sistema:

* **Gestión de Insumos:** Control operativo de inventarios en centros de acopio, trazabilidad de recursos por lotes, fechas de vencimiento, procesamiento de donaciones y flujo de solicitudes.
* **Transporte y Encomiendas:** Logística de distribución, asignación física de cargas a transportistas, control de estados de envío y validación de rutas de entrega.
* **Rescate Animal:** Censo, categorización por especies y actualización de estatus médico o de ubicación para fauna en zonas de contingencia.
* **Refugios:** Monitoreo de capacidad instalada, asignación de espacios habitacionales y registro censal de personas damnificadas o reubicadas.

---

## ESTRUCTURA DEL MODELO DE DATOS

El esquema de la base de datos se organiza en base a las siguientes entidades principales:

* **Usuarios y Permisos (`users`, `personal`, `puestos`):** Control de acceso global, roles del sistema y asignación de personal operativo a entidades específicas.
* **Entidades (`entidades`):** Registro de centros de acopio, refugios y organizaciones verificadas con su respectiva ubicación geopolítica estructurada.
* **Catálogo e Inventario (`recursos`, `detalles_recursos`, `inventarios`):** Listado maestro de insumos, especificaciones técnicas de lotes y existencias en tiempo real por entidad.
* **Flujo Físico (`solicitudes_recursos`, `donaciones`):** Registro histórico y activo de movimientos, requerimientos de insumos y aportes recibidos.

---

## INSTALACIÓN Y ENTORNO LOCAL

Instalar las dependencias del proyecto:

```bash
npm install

```

Configurar las variables de entorno en la raíz del proyecto creando un archivo `.env`:

```env
DATABASE_URL="postgres://usuario:password@localhost:5432/amparovzla"

JWT_SECRET=""

```

Ejecutar el servidor de desarrollo local:

```bash
npm run dev

```