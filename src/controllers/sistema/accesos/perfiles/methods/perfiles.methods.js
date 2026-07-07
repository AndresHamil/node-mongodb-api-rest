import { DB_COLLECTION_PERFILES } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";

export const getPerfilesCollection = async () => getCollection(DB_COLLECTION_PERFILES);

export const buscarPerfilPorId = async (perfilId) => {
    const objectId = utils.validarObjectId(perfilId, "El", "perfilId", true);
    const perfilesCollection = await getPerfilesCollection();
    return perfilesCollection.findOne({ _id: objectId });
};

const validarPermiso = (permiso, index) => {
    utils.validarTipoDato(permiso, "El", `permisos[${index}]`, "string");
    const permisoNormalizado = utils.normalizarString(permiso);

    utils.validarRequerido(permisoNormalizado, "El", `permisos[${index}]`);

    if (!/^[a-z]+(\.[a-z]+){2,5}$/.test(permisoNormalizado)) {
        throw utils.crearErrorAplicacion({
            message: `Invalid permission format at permisos[${index}].`,
            customMessage: `El permiso '${permisoNormalizado}' no tiene un formato válido. Usa claves como gestion.usuarios.registrar.`,
            statusCode: 422,
            code: "INVALID_PERMISSION_FORMAT",
        });
    }

    return permisoNormalizado;
};

export const normalizarPermisosPerfil = (permisos = null) => {
    if (permisos == null) {
        return [];
    }

    if (!Array.isArray(permisos)) {
        throw utils.crearErrorAplicacion({
            message: "Permisos must be an array.",
            customMessage: "Los permisos deben enviarse como un arreglo.",
            statusCode: 422,
            code: "INVALID_PERMISSIONS_PAYLOAD",
        });
    }

    const permisosNormalizados = permisos.map(validarPermiso);
    return Array.from(new Set(permisosNormalizados)).sort();
};

export const prepararRegistroPerfil = (payload = {}) => {
    let {
        nombre = null,
        descripcion = null,
        usuarioRegistroId = null,
    } = payload;

    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(descripcion, "La", "descripcion", "string");
    utils.validarTipoDato(usuarioRegistroId, "El", "usuarioRegistroId", "string");

    nombre = utils.normalizarNombre(nombre);
    descripcion = utils.normalizarCampoOpcional(descripcion);

    utils.validarRequerido(nombre, "El", "nombre");
    utils.validarRequerido(usuarioRegistroId, "El", "usuarioRegistroId");
    utils.validarContenidoString(nombre, "El", "nombre");
    utils.validarLongitudString(nombre, "El", "nombre", 80);

    if (descripcion != null && descripcion !== "") {
        utils.validarLongitudString(descripcion, "La", "descripcion", 200);
    }

    return {
        nombre,
        descripcion,
        usuarioRegistroId,
        nombreNormalizado: utils.normalizarString(nombre).toLowerCase(),
    };
};

export const validarDuplicadoPerfil = async (collection, { nombreNormalizado }) => {
    const perfilExistente = await collection.findOne({ nombreNormalizado });

    if (!perfilExistente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Profile already exists.",
        customMessage: "Ya existe un perfil con el mismo nombre.",
        statusCode: 409,
        code: "PERFIL_DUPLICADO",
    });
};

export const construirDocumentoNuevoPerfil = ({ nombre, descripcion, permisos = [], nombreNormalizado, usuarioRegistroObjectId }) => {
    const fechaActual = new Date();
    const permisosNormalizados = normalizarPermisosPerfil(permisos);

    return {
        nombre,
        descripcion: descripcion === "" ? null : (descripcion ?? null),
        permisos: permisosNormalizados,
        permisosManual: permisosNormalizados,
        accesos: [],
        nombreNormalizado,
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: fechaActual,
        fechaActualizacion: fechaActual,
    };
};

export const validarPerfilActivo = async (perfilId) => {
    const perfil = await buscarPerfilPorId(perfilId);

    if (!perfil || perfil.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Profile not found.",
            customMessage: "El perfil indicado no existe o está inactivo.",
            statusCode: 404,
            code: "PERFIL_NO_ENCONTRADO",
        });
    }

    return perfil;
};

export const construirRespuestaPerfil = (perfil) => {
    return {
        id: perfil._id.toString(),
        nombre: perfil.nombre,
        descripcion: perfil.descripcion ?? null,
        permisos: perfil.permisos ?? [],
        accesos: (perfil.accesos ?? []).map((acceso) => ({
            moduloId: acceso.fkModuloId?.toString?.() ?? null,
            procesoId: acceso.fkProcesoId?.toString?.() ?? null,
            sucursales: (acceso.fkSucursales ?? []).map((sucursalId) => sucursalId?.toString?.() ?? null),
            departamentos: (acceso.fkDepartamentos ?? []).map((departamentoId) => departamentoId?.toString?.() ?? null),
            tipoPermiso: acceso.tipoPermiso ?? null,
            permisos: acceso.permisos ?? [],
            usuarios: (acceso.usuarios ?? []).map((usuario) => ({
                usuarioId: usuario.fkUsuarioId?.toString?.() ?? null,
                tipoPermiso: usuario.tipoPermiso ?? null,
                permisos: usuario.permisos ?? [],
            })),
            usuarioRegistroId: acceso.usuarioRegistroId?.toString?.() ?? null,
        })),
        estado: perfil.estado ?? true,
        usuarioRegistroId: perfil.usuarioRegistroId?.toString?.() ?? null,
        fechaRegistro: utils.formatearFecha(perfil.fechaRegistro),
        fechaActualizacion: utils.formatearFecha(perfil.fechaActualizacion),
    };
};

export const construirPayloadPerfil = (perfil) => ({
    perfil: construirRespuestaPerfil(perfil),
});