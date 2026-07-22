declare global {
  namespace App {
    interface Locals {
      usuarios: {
        id: string;
        nombre: string;
        apellido: string;
        cedula: string;
        genero: string;
        telefono: string;
        fechaNacimiento: string;
        tipoSangre?: string;
        rol: string;
        correo: string;
        password: string;
        profesionId?: string;
        puestoId?: string;
        talento1?: string;
        talento2?: string;
        talento3?: string;
        talento4?: string;
        colaboracion1?: string;
        colaboracion2?: string;
        colaboracion3?: string;
        colaboracion4?: string;
        disponibilidad: string;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string;
      };
      personas: {
        id: string;
        nombre: string;
        apellido: string;
        img?: string;
        cedula?: string;
        genero: string;
        tipoSangre?: string;
        telefono?: string;
        fechaNacimiento: string;
        caracteristicas: string;
        estado: string;
        municipio?: string;
        localidad?: string;
        direccionExacta?: string;
        estatus: string;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string;
      };
      entidades: {
        id: string;
        codigo: string;
        encargadoId: string;
        tipo: string;
        nombre: string;
        telefonoPrincipal: string;
        telefonoSecundario: string;
        emailContacto: string;
        estado: string;
        municipio: string;
        localidad: string;
        direccionExacta: string;
        latitud: number;
        longitud: number;
        verificado: boolean;
        estatus: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string;
      };
    }
  }
}

export {};
