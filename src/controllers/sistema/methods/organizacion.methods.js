import * as utils from "../../../utils/methods.js";
import * as usuariosMethods from "../accesos/usuarios/methods/usuarios.methods.js";

export const validarUsuarioRegistro = async ({ usuarioRegistroId, usuarioSesionId = null }) => {
    const usuarioRegistroObjectId = utils.validarObjectId(usuarioRegistroId, "El", "usuarioRegistroId", true);

    if (usuarioSesionId && usuarioRegistroObjectId.toString() !== usuarioSesionId) {
        throw utils.crearErrorAplicacion({
            message: "The usuarioRegistroId does not match the authenticated session.",
            customMessage: "El usuarioRegistroId debe coincidir con la sesión activa.",
            statusCode: 403,
            code: "CREATOR_SESSION_MISMATCH",
        });
    }

    const usuarioRegistro = await usuariosMethods.buscarUsuarioPorId(usuarioRegistroObjectId);

    if (!usuarioRegistro || usuarioRegistro.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Creator user not found or inactive.",
            customMessage: "El usuarioRegistroId no pertenece a un usuario activo.",
            statusCode: 404,
            code: "CREATOR_USER_NOT_FOUND",
        });
    }

    return usuarioRegistroObjectId;
};

export const prepararPayloadBaseOrganizacional = ({ nombre = null, descripcion = null, usuarioRegistroId = null } = {}) => {
    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(descripcion, "La", "descripcion", "string");
    utils.validarTipoDato(usuarioRegistroId, "El", "usuarioRegistroId", "string");

    const nombreNormalizado = utils.normalizarNombre(nombre);
    const descripcionNormalizada = utils.normalizarCampoOpcional(descripcion);

    utils.validarRequerido(nombreNormalizado, "El", "nombre");
    utils.validarRequerido(usuarioRegistroId, "El", "usuarioRegistroId");
    utils.validarContenidoString(nombreNormalizado, "El", "nombre");
    utils.validarLongitudString(nombreNormalizado, "El", "nombre", 80);

    if (descripcionNormalizada != null && descripcionNormalizada !== "") {
        utils.validarLongitudString(descripcionNormalizada, "La", "descripcion", 200);
    }

    return {
        nombre: nombreNormalizado,
        descripcion: descripcionNormalizada,
        usuarioRegistroId,
        nombreNormalizado: utils.normalizarString(nombreNormalizado).toLowerCase(),
    };
};

export const construirRespuestaOrganizacional = (documento, extra = {}) => {
    return {
        id: documento._id.toString(),
        nombre: documento.nombre,
        descripcion: documento.descripcion ?? null,
        estado: documento.estado ?? true,
        usuarioRegistroId: documento.usuarioRegistroId?.toString?.() ?? null,
        fechaRegistro: utils.formatearFecha(documento.fechaRegistro),
        fechaActualizacion: utils.formatearFecha(documento.fechaActualizacion),
        ...extra,
    };
};

export const construirDocumentoBaseOrganizacional = ({ nombre, descripcion, nombreNormalizado, usuarioRegistroObjectId } = {}) => {
    const fechaActual = new Date();

    return {
        nombre,
        descripcion: descripcion === "" ? null : (descripcion ?? null),
        nombreNormalizado,
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: fechaActual,
        fechaActualizacion: fechaActual,
    };
};