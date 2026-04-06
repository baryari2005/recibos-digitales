import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERMISOS = [
    { modulo: "legajo", accion: "ver", descripcion: "Permite visualizar la información del legajo.", icono: "fileText" },
    { modulo: "legajo", accion: "editar", descripcion: "Permite modificar la información del legajo.", icono: "pencil" },

    { modulo: "licencias", accion: "ver", descripcion: "Permite visualizar solicitudes y datos de licencias.", icono: "eye" },
    { modulo: "licencias", accion: "aprobar", descripcion: "Permite aprobar solicitudes de licencia.", icono: "checkCircle" },
    { modulo: "licencias", accion: "rechazar", descripcion: "Permite rechazar solicitudes de licencia.", icono: "xCircle" },
    { modulo: "licencias", accion: "cargar", descripcion: "Permite cargar una nueva solicitud de licencia.", icono: "plus" },
    { modulo: "licencias", accion: "cancelar", descripcion: "Permite cancelar solicitudes de licencia.", icono: "ban" },

    { modulo: "recibos", accion: "ver", descripcion: "Permite visualizar recibos cargados en el sistema.", icono: "eye" },
    { modulo: "recibos", accion: "subir", descripcion: "Permite subir recibos al sistema.", icono: "upload" },
    { modulo: "recibos", accion: "seguimiento", descripcion: "Permite hacer seguimiento del estado de los recibos.", icono: "search" },
    { modulo: "recibos", accion: "firmar", descripcion: "Permite firmar recibos digitalmente.", icono: "fileSignature" },

    { modulo: "roles", accion: "ver", descripcion: "Permite visualizar roles y permisos disponibles.", icono: "eye" },
    { modulo: "roles", accion: "crear", descripcion: "Permite crear nuevos roles.", icono: "plus" },
    { modulo: "roles", accion: "editar", descripcion: "Permite modificar la configuración de un rol.", icono: "pencil" },
    { modulo: "roles", accion: "eliminar", descripcion: "Permite eliminar roles del sistema.", icono: "trash" },

    { modulo: "usuarios", accion: "ver", descripcion: "Permite visualizar el listado y detalle de usuarios.", icono: "eye" },
    { modulo: "usuarios", accion: "crear", descripcion: "Permite dar de alta nuevos usuarios en el sistema.", icono: "plus" },
    { modulo: "usuarios", accion: "editar", descripcion: "Permite modificar los datos de un usuario existente.", icono: "pencil" },
    { modulo: "usuarios", accion: "eliminar", descripcion: "Permite eliminar usuarios del sistema.", icono: "trash" },
    { modulo: "usuarios", accion: "importar", descripcion: "Permite importar usuarios desde archivos externos.", icono: "upload" },
    { modulo: "usuarios", accion: "exportar", descripcion: "Permite exportar usuarios a un archivo.", icono: "download" },

    { modulo: "vacaciones", accion: "ver", descripcion: "Permite visualizar solicitudes y datos de vacaciones.", icono: "eye" },
    { modulo: "vacaciones", accion: "aprobar", descripcion: "Permite aprobar solicitudes de vacaciones.", icono: "checkCircle" },
    { modulo: "vacaciones", accion: "rechazar", descripcion: "Permite rechazar solicitudes de vacaciones.", icono: "xCircle" },
    { modulo: "vacaciones", accion: "cargar", descripcion: "Permite cargar una nueva solicitud de vacaciones.", icono: "plus" },
    { modulo: "vacaciones", accion: "cancelar", descripcion: "Permite cancelar solicitudes de vacaciones.", icono: "ban" },
    { modulo: "vacaciones", accion: "asignar", descripcion: "Permite asignar vacaciones a un usuario.", icono: "calendarPlus" },
];


async function main() {
    for (const p of PERMISOS) {
        await prisma.permiso.upsert({
            where: {
                modulo_accion: {
                    modulo: p.modulo,
                    accion: p.accion,
                },
            },
            update: {
                descripcion: p.descripcion,
                icono: p.icono,
            },
            create: {
                modulo: p.modulo,
                accion: p.accion,
                nombre: `${p.modulo}:${p.accion}`,
                descripcion: p.descripcion,
                icono: p.icono,
            },
        });
    }

    const adminRole = await prisma.rol.findFirst({
        where: {
            nombre: {
                equals: "administrador",
                mode: "insensitive",
            },
        },
    });

    if (adminRole) {
        const permisos = await prisma.permiso.findMany();

        await prisma.rolPermiso.deleteMany({
            where: { rolId: adminRole.id },
        });

        await prisma.rolPermiso.createMany({
            data: permisos.map((permiso) => ({
                rolId: adminRole.id,
                permisoId: permiso.id,
            })),
            skipDuplicates: true,
        });
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });