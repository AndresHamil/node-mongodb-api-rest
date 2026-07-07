import { ObjectId } from "mongodb";
import * as utils from "../../../../../utils/methods.js";
import * as sistemaMethods from "../../../methods/sistema.methods.js";
import * as perfilesMethods from "../../perfiles/methods/perfiles.methods.js";
import * as usuariosMethods from "../../usuarios/methods/usuarios.methods.js";
import * as sucursalesMethods from "../../../organizacion/sucursales/methods/sucursales.methods.js";
import * as departamentosMethods from "../../../organizacion/departamentos/methods/departamentos.methods.js";
import * as modulosMethods from "../../../sistemas/modulos/methods/modulos.methods.js";
import * as procesosMethods from "../../../sistemas/procesos/methods/procesos.methods.js";

const TIPOS_PERMISO_VALIDOS = new Set([0, 1]);

const normalizarIdsUnicos = (items = []) => Array.from(new Set(items.map((item) => item.toString())));

const sameIdArray = (left = [], right = []) => {
    const leftIds = normalizarIdsUnicos(left.map((item) => item?.toString?.() ?? item)).sort();
    const rightIds = normalizarIdsUnicos(right.map((item) => item?.toString?.() ?? item)).sort();

    return leftIds.length === rightIds.length && leftIds.every((item, index) => item === rightIds[index]);
};

const construirOverrideUsuario = ({ usuarioId, tipoPermiso, modulo, proceso, usuarioRegistroObjectId }, actual = null) => {
    const fechaActual = new Date();

    return {
        fkUsuarioId: new ObjectId(usuarioId),
        tipoPermiso,
        permisos: sistemaMethods.construirPermisosAccesoProceso({ modulo, proceso, tipoPermiso }),
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: actual?.fechaRegistro ?? fechaActual,
        fechaActualizacion: fechaActual,
    };
};

const construirAccesoPerfil = ({ modulo, proceso, sucursalIds, departamentoIds, overridesUsuarios, usuarioRegistroObjectId }, actual = null) => {
    const fechaActual = new Date();
    const tipoPermiso = 0;

    return {
        fkModuloId: modulo._id,
        fkProcesoId: proceso._id,
        fkSucursales: sucursalIds.map((id) => new ObjectId(id)),
        fkDepartamentos: departamentoIds.map((id) => new ObjectId(id)),
        tipoPermiso,
        permisos: sistemaMethods.construirPermisosAccesoProceso({ modulo, proceso, tipoPermiso }),
        usuarios: overridesUsuarios,
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: actual?.fechaRegistro ?? fechaActual,
        fechaActualizacion: fechaActual,
    };
};

const sincronizarPermisosPerfil = (perfil) => {
    const permisosBase = Array.isArray(perfil.permisosManual) ? perfil.permisosManual : [];
    const permisosAccesos = (perfil.accesos ?? []).flatMap((acceso) => acceso.permisos ?? []);
    return Array.from(new Set([...permisosBase, ...permisosAccesos])).sort();
};

const validarTipoPermiso = (tipoPermiso, index) => {
    utils.validarTipoDato(tipoPermiso, "El", `usuarios[${index}].tipo`, "int");

    if (!TIPOS_PERMISO_VALIDOS.has(tipoPermiso)) {
        throw utils.crearErrorAplicacion({
            message: "Invalid permission type.",
            customMessage: "El tipo de permiso del usuario debe ser 0 o 1.",
            statusCode: 422,
            code: "INVALID_PERMISSION_TYPE",
        });
    }

    return tipoPermiso;
};

export const prepararAsignacionPermiso = (payload = {}) => {
    let {
        procesoId = null,
        sucursales = [],
        departamentos = [],
        perfiles = [],
        usuarios = [],
        usuarioRegistroId = null,
    } = payload;

    utils.validarTipoDato(procesoId, "El", "procesoId", "string");
    utils.validarTipoDato(usuarioRegistroId, "El", "usuarioRegistroId", "string");
    utils.validarTipoDato(sucursales, "Las", "sucursales", "array");
    utils.validarTipoDato(departamentos, "Los", "departamentos", "array");
    utils.validarTipoDato(perfiles, "Los", "perfiles", "array");
    utils.validarTipoDato(usuarios, "Los", "usuarios", "array");

    procesoId = utils.normalizarString(procesoId);
    usuarioRegistroId = utils.normalizarString(usuarioRegistroId);
    utils.validarRequerido(procesoId, "El", "procesoId");
    utils.validarRequerido(usuarioRegistroId, "El", "usuarioRegistroId");

    const sucursalIds = normalizarIdsUnicos(sucursales.map((sucursalId, index) => {
        utils.validarTipoDato(sucursalId, "La", `sucursales[${index}]`, "string");
        return utils.validarObjectId(utils.normalizarString(sucursalId), "La", `sucursales[${index}]`, true).toString();
    }));

    const departamentoIds = normalizarIdsUnicos(departamentos.map((departamentoId, index) => {
        utils.validarTipoDato(departamentoId, "El", `departamentos[${index}]`, "string");
        return utils.validarObjectId(utils.normalizarString(departamentoId), "El", `departamentos[${index}]`, true).toString();
    }));

    const perfilIds = normalizarIdsUnicos(perfiles.map((perfilId, index) => {
        utils.validarTipoDato(perfilId, "El", `perfiles[${index}]`, "string");
        return utils.validarObjectId(utils.normalizarString(perfilId), "El", `perfiles[${index}]`, true).toString();
    }));

    if (perfilIds.length === 0) {
        throw utils.crearErrorAplicacion({
            message: "Profiles are required.",
            customMessage: "Debes indicar al menos un perfil para asignar el permiso base.",
            statusCode: 422,
            code: "EMPTY_PROFILES_ASSIGNMENT",
        });
    }

    const usuariosNormalizados = [];

    usuarios.forEach((usuario, index) => {
        utils.validarTipoDato(usuario, "El", `usuarios[${index}]`, "object");
        const usuarioId = utils.validarObjectId(utils.normalizarString(usuario?.id), "El", `usuarios[${index}].id`, true).toString();
        const tipoPermiso = validarTipoPermiso(usuario?.tipo, index);
        const existente = usuariosNormalizados.find((item) => item.id === usuarioId);

        if (existente) {
            existente.tipo = Math.max(existente.tipo, tipoPermiso);
            return;
        }

        usuariosNormalizados.push({ id: usuarioId, tipo: tipoPermiso });
    });

    return {
        procesoId,
        sucursalIds,
        departamentoIds,
        perfilIds,
        usuarios: usuariosNormalizados,
        usuarioRegistroId,
    };
};

const validarSucursales = async (sucursalIds = []) => {
    const sucursales = await Promise.all(sucursalIds.map((sucursalId) => sucursalesMethods.buscarSucursalPorId(sucursalId)));

    sucursales.forEach((sucursal) => {
        if (!sucursal || sucursal.estado === false) {
            throw utils.crearErrorAplicacion({
                message: "Branch not found.",
                customMessage: "Una de las sucursales indicadas no existe o está inactiva.",
                statusCode: 404,
                code: "SUCURSAL_NO_ENCONTRADA",
            });
        }
    });

    return sucursales;
};

const validarDepartamentos = async (departamentoIds = [], sucursales = []) => {
    const departamentos = await Promise.all(departamentoIds.map((departamentoId) => departamentosMethods.buscarDepartamentoPorId(departamentoId)));
    const sucursalIds = normalizarIdsUnicos(sucursales.map((sucursal) => sucursal?._id?.toString?.() ?? sucursal));

    departamentos.forEach((departamento) => {
        if (!departamento || departamento.estado === false) {
            throw utils.crearErrorAplicacion({
                message: "Department not found.",
                customMessage: "Uno de los departamentos indicados no existe o está inactivo.",
                statusCode: 404,
                code: "DEPARTAMENTO_NO_ENCONTRADO",
            });
        }

        if (sucursalIds.length > 0 && !sucursalIds.includes(departamento.fkSucursalId?.toString?.())) {
            throw utils.crearErrorAplicacion({
                message: "Department does not belong to selected branches.",
                customMessage: "Uno de los departamentos no pertenece a las sucursales seleccionadas.",
                statusCode: 422,
                code: "DEPARTAMENTO_SUCURSAL_INVALIDA",
            });
        }
    });

    return departamentos;
};

const validarPerfiles = async (perfilIds = []) => Promise.all(perfilIds.map((perfilId) => perfilesMethods.validarPerfilActivo(perfilId)));

const validarUsuarios = async (usuarios = [], { perfilIds = [], sucursalIds = [], departamentoIds = [] } = {}) => {
    const usuariosValidados = await Promise.all(usuarios.map(async (usuario) => {
        const documento = await usuariosMethods.buscarUsuarioPorId(usuario.id);

        if (!documento || documento.estado === false) {
            throw utils.crearErrorAplicacion({
                message: "User not found.",
                customMessage: "Uno de los usuarios indicados no existe o está inactivo.",
                statusCode: 404,
                code: "USUARIO_NO_ENCONTRADO",
            });
        }

        const asignacionCompatible = (documento.asignaciones ?? []).some((asignacion) => {
            if (asignacion.estado === false) {
                return false;
            }

            const perfilOk = perfilIds.includes(asignacion.fkPerfilId?.toString?.());
            const sucursalOk = sucursalIds.length === 0 || sucursalIds.includes(asignacion.fkSucursalId?.toString?.());
            const departamentoOk = departamentoIds.length === 0 || departamentoIds.includes(asignacion.fkDepartamentoId?.toString?.());
            return perfilOk && sucursalOk && departamentoOk;
        });

        if (!asignacionCompatible) {
            throw utils.crearErrorAplicacion({
                message: "User assignment does not match selected scope.",
                customMessage: "Uno de los usuarios no pertenece al perfil o alcance organizacional seleccionado.",
                statusCode: 422,
                code: "USUARIO_SCOPE_INVALID",
            });
        }

        return {
            ...usuario,
            documento,
        };
    }));

    return usuariosValidados;
};

export const resolverContextoAsignacion = async (payload, usuarioRegistroObjectId) => {
    const proceso = await procesosMethods.validarProcesoActivo(payload.procesoId);
    const modulo = await modulosMethods.validarModuloActivo(proceso.fkModuloId?.toString?.() ?? proceso.fkModuloId);
    const sucursales = await validarSucursales(payload.sucursalIds);
    const departamentos = await validarDepartamentos(payload.departamentoIds, sucursales);
    const perfiles = await validarPerfiles(payload.perfilIds);
    const usuarios = await validarUsuarios(payload.usuarios, payload);

    return {
        payload,
        proceso,
        modulo,
        sucursales,
        departamentos,
        perfiles,
        usuarios,
        usuarioRegistroObjectId,
    };
};

export const registrarPermisoPerfiles = async ({ proceso, modulo, sucursales, departamentos, perfiles, usuarios, usuarioRegistroObjectId }) => {
    const perfilesCollection = await perfilesMethods.getPerfilesCollection();
    const overridesUsuarios = usuarios.map((usuario) => construirOverrideUsuario({
        usuarioId: usuario.id,
        tipoPermiso: usuario.tipo,
        modulo,
        proceso,
        usuarioRegistroObjectId,
    }));

    for (const perfil of perfiles) {
        const accesos = [...(perfil.accesos ?? [])];
        const accessIndex = accesos.findIndex((acceso) => {
            const mismoProceso = acceso.fkProcesoId?.toString?.() === proceso._id.toString();
            return mismoProceso
                && sameIdArray(acceso.fkSucursales ?? [], sucursales.map((item) => item._id))
                && sameIdArray(acceso.fkDepartamentos ?? [], departamentos.map((item) => item._id));
        });

        if (accessIndex >= 0) {
            const accesoActual = accesos[accessIndex];
            const usuariosActuales = [...(accesoActual.usuarios ?? [])];

            overridesUsuarios.forEach((override) => {
                const usuarioIndex = usuariosActuales.findIndex((usuario) => usuario.fkUsuarioId?.toString?.() === override.fkUsuarioId.toString());

                if (usuarioIndex >= 0) {
                    usuariosActuales[usuarioIndex] = construirOverrideUsuario({
                        usuarioId: override.fkUsuarioId.toString(),
                        tipoPermiso: override.tipoPermiso,
                        modulo,
                        proceso,
                        usuarioRegistroObjectId,
                    }, usuariosActuales[usuarioIndex]);
                    return;
                }

                usuariosActuales.push(override);
            });

            accesos[accessIndex] = construirAccesoPerfil({
                modulo,
                proceso,
                sucursalIds: sucursales.map((item) => item._id.toString()),
                departamentoIds: departamentos.map((item) => item._id.toString()),
                overridesUsuarios: usuariosActuales,
                usuarioRegistroObjectId,
            }, accesoActual);
        } else {
            accesos.push(construirAccesoPerfil({
                modulo,
                proceso,
                sucursalIds: sucursales.map((item) => item._id.toString()),
                departamentoIds: departamentos.map((item) => item._id.toString()),
                overridesUsuarios,
                usuarioRegistroObjectId,
            }));
        }

        const perfilActualizado = {
            ...perfil,
            accesos,
            fechaActualizacion: new Date(),
        };
        perfilActualizado.permisos = sincronizarPermisosPerfil(perfilActualizado);

        await perfilesCollection.updateOne(
            { _id: perfil._id },
            {
                $set: {
                    accesos: perfilActualizado.accesos,
                    permisos: perfilActualizado.permisos,
                    fechaActualizacion: perfilActualizado.fechaActualizacion,
                },
            }
        );
    }

    return {
        proceso,
        modulo,
        sucursales,
        departamentos,
        perfiles,
        usuarios,
    };
};

export const construirRespuestaAsignacionPermiso = ({ proceso, modulo, sucursales, departamentos, perfiles, usuarios }) => ({
    modulo: {
        id: modulo._id.toString(),
        nombre: modulo.nombre,
        codigo: modulo.codigo ?? null,
        tipo: modulo.tipo ?? null,
        icono: modulo.icono ?? null,
    },
    proceso: {
        id: proceso._id.toString(),
        nombre: proceso.nombre,
        descripcion: proceso.descripcion ?? null,
        codigo: proceso.codigo ?? null,
        url: proceso.url ?? null,
        icono: proceso.icono ?? null,
    },
    perfiles: perfiles.map((perfil) => ({
        id: perfil._id.toString(),
        nombre: perfil.nombre,
        tipoPermiso: 0,
    })),
    usuarios: usuarios.map((usuario) => ({
        id: usuario.documento._id.toString(),
        nombre: usuario.documento.nombre,
        apellido: usuario.documento.apellido,
        tipoPermiso: usuario.tipo,
    })),
    alcance: {
        sucursales: sucursales.map((sucursal) => ({
            id: sucursal._id.toString(),
            nombre: sucursal.nombre,
        })),
        departamentos: departamentos.map((departamento) => ({
            id: departamento._id.toString(),
            nombre: departamento.nombre,
        })),
    },
});

export const construirPayloadPermiso = (resultado) => ({
    permiso: construirRespuestaAsignacionPermiso(resultado),
});