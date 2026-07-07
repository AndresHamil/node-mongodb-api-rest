import { DB_COLLECTION_MODULOS } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";
import * as sistemaMethods from "../../../methods/sistema.methods.js";

const MODULO_TYPE_MAP = {
    0: "sistemas",
    1: "gestion",
    "0": "sistemas",
    "1": "gestion",
    gestion: "gestion",
    gestiones: "gestion",
    sistema: "sistemas",
    sistemas: "sistemas",
    otro: "otros",
    otros: "otros",
};

export const normalizarTipoModulo = (tipo = null) => {
    const tipoNormalizado = typeof tipo === "number"
        ? tipo
        : (utils.normalizarCampoOpcional(tipo)?.toLowerCase() ?? null);

    if (tipoNormalizado == null || tipoNormalizado === "") {
        throw utils.crearErrorAplicacion({
            message: "Module type is required.",
            customMessage: "El tipo del módulo es requerido y debe ser gestion o sistemas.",
            statusCode: 422,
            code: "MODULE_TYPE_REQUIRED",
        });
    }

    const tipoResuelto = MODULO_TYPE_MAP[tipoNormalizado] ?? null;

    if (!tipoResuelto) {
        throw utils.crearErrorAplicacion({
            message: "Invalid module type.",
            customMessage: "El tipo del módulo debe ser gestion o sistemas.",
            statusCode: 422,
            code: "INVALID_MODULE_TYPE",
        });
    }

    if (!["gestion", "sistemas"].includes(tipoResuelto)) {
        throw utils.crearErrorAplicacion({
            message: "Unsupported module type.",
            customMessage: "Por ahora el tipo del módulo debe ser gestion o sistemas.",
            statusCode: 422,
            code: "UNSUPPORTED_MODULE_TYPE",
        });
    }

    return tipoResuelto;
};

export const getModulosCollection = async () => getCollection(DB_COLLECTION_MODULOS);

export const buscarModuloPorId = async (moduloId) => {
    const objectId = utils.validarObjectId(moduloId, "El", "moduloId", true);
    const modulosCollection = await getModulosCollection();
    return modulosCollection.findOne({ _id: objectId });
};

export const prepararRegistroModulo = (payload = {}) => {
    let {
        nombre = null,
        descripcion = null,
        tipo = null,
        codigo = null,
        icono = null,
        usuarioRegistroId = null,
    } = payload;

    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(descripcion, "La", "descripcion", "string");
    if (!(tipo === null || typeof tipo === "string" || Number.isInteger(tipo))) {
        throw utils.crearErrorAplicacion({
            message: "The tipo does not have the correct format.",
            customMessage: "El tipo no tiene el formato adecuado.",
            statusCode: 422,
            code: "INVALID_MODULE_TYPE_FORMAT",
        });
    }
    utils.validarTipoDato(codigo, "El", "codigo", "string");
    utils.validarTipoDato(icono, "El", "icono", "string");
    utils.validarTipoDato(usuarioRegistroId, "El", "usuarioRegistroId", "string");

    nombre = utils.normalizarNombre(nombre);
    descripcion = utils.normalizarCampoOpcional(descripcion);
    tipo = normalizarTipoModulo(tipo);
    codigo = codigo == null ? null : sistemaMethods.construirSlugSistema(codigo, "el código del módulo");
    icono = utils.normalizarString(icono);
    usuarioRegistroId = utils.normalizarString(usuarioRegistroId);

    utils.validarRequerido(nombre, "El", "nombre");
    utils.validarRequerido(icono, "El", "icono");
    utils.validarRequerido(usuarioRegistroId, "El", "usuarioRegistroId");
    utils.validarContenidoString(nombre, "El", "nombre");
    utils.validarLongitudString(nombre, "El", "nombre", 80);
    utils.validarLongitudString(icono, "El", "icono", 80);

    if (descripcion != null && descripcion !== "") {
        utils.validarLongitudString(descripcion, "La", "descripcion", 200);
    }

    if (tipo != null && tipo !== "") {
        utils.validarLongitudString(tipo, "El", "tipo", 50);
    }

    const codigoFinal = codigo ?? sistemaMethods.construirSlugSistema(nombre, "el nombre del módulo");

    return {
        nombre,
        descripcion,
        tipo,
        codigo: codigoFinal,
        icono,
        usuarioRegistroId,
        nombreNormalizado: utils.normalizarString(nombre).toLowerCase(),
    };
};

export const validarDuplicadoModulo = async (collection, { codigo, nombreNormalizado }) => {
    const existente = await collection.findOne({
        $or: [
            { codigo },
            { nombreNormalizado },
        ],
    });

    if (!existente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Module already exists.",
        customMessage: "Ya existe un módulo con el mismo nombre o código.",
        statusCode: 409,
        code: "MODULO_DUPLICADO",
    });
};

export const validarModuloActivo = async (moduloId) => {
    const modulo = await buscarModuloPorId(moduloId);

    if (!modulo || modulo.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Module not found.",
            customMessage: "El módulo indicado no existe o está inactivo.",
            statusCode: 404,
            code: "MODULO_NO_ENCONTRADO",
        });
    }

    return modulo;
};

export const construirDocumentoNuevoModulo = ({ nombre, descripcion, tipo, codigo, icono, nombreNormalizado, usuarioRegistroObjectId }) => {
    const fechaActual = new Date();

    return {
        nombre,
        descripcion: descripcion === "" ? null : (descripcion ?? null),
        tipo: tipo === "" ? null : (tipo ?? null),
        codigo,
        icono,
        nombreNormalizado,
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: fechaActual,
        fechaActualizacion: fechaActual,
    };
};

export const construirRespuestaModulo = (modulo) => ({
    id: modulo._id.toString(),
    nombre: modulo.nombre,
    descripcion: modulo.descripcion ?? null,
    tipo: modulo.tipo ?? null,
    codigo: modulo.codigo,
    icono: modulo.icono ?? null,
    estado: modulo.estado ?? true,
    usuarioRegistroId: modulo.usuarioRegistroId?.toString?.() ?? null,
    fechaRegistro: utils.formatearFecha(modulo.fechaRegistro),
    fechaActualizacion: utils.formatearFecha(modulo.fechaActualizacion),
});