import { Prisma } from "@prisma/client";
import { toYmdUTC } from "./user.date";

export type UserWithRole = Prisma.UsuarioGetPayload<{
  include: { rol: true };
}>;

export function toUserListItem(u: UserWithRole) {
  return {
    id: u.id,
    userId: u.userId,
    email: u.email,
    nombre: u.nombre,
    apellido: u.apellido,
    avatarUrl: u.avatarUrl,
    rol: u.rol ? { id: u.rol.id, nombre: u.rol.nombre } : null,
    createdAt: u.createdAt,

    tipoDocumento: u.tipoDocumento,
    documento: u.documento,
    cuil: u.cuil,
    celular: u.celular,
    domicilio: u.domicilio,
    codigoPostal: u.codigoPostal,
    fechaNacimiento: u.fechaNacimiento,
    genero: u.genero,
    estadoCivil: u.estadoCivil,
    nacionalidad: u.nacionalidad,
  };
}

export function toUserDetail(user: UserWithRole) {
  return {
    id: user.id,
    userId: user.userId,
    email: user.email,
    rolId: user.rolId,
    rol: user.rol ? { id: user.rol.id, nombre: user.rol.nombre } : null,

    nombre: user.nombre,
    apellido: user.apellido,
    avatarUrl: user.avatarUrl,
    celular: user.celular,
    domicilio: user.domicilio,
    codigoPostal: user.codigoPostal,

    tipoDocumento: user.tipoDocumento,
    documento: user.documento,
    cuil: user.cuil,

    fechaNacimiento: toYmdUTC(user.fechaNacimiento),
    genero: user.genero,
    estadoCivil: user.estadoCivil,
    nacionalidad: user.nacionalidad,
  };
}