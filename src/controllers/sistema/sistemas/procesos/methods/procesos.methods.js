import { DB_COLLECTION_PROCESOS } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";
import * as sistemaMethods from "../../../methods/sistema.methods.js";
import * as modulosMethods from "../../modulos/methods/modulos.methods.js";

export const getProcesosCollection = async () => getCollection(DB_COLLECTION_PROCESOS);

export const buscarProcesoPorId = async (procesoId) => {
    const objectId = utils.validarObjectId(procesoId, "El", "procesoId", true);
    const procesosCollection = await getProcesosCollection();
    return procesosCollection.findOne({ _id: objectId });
};

export const prepararRegistroProceso = (payload = {}) => {
    let {
        moduloId = null,
        nombre = null,
        descripcion = null,
        codigo = null,
        icono = null,
        usuarioRegistroId = null,
    } = payload;

    utils.validarTipoDato(moduloId, "El", "moduloId", "string");
    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(descripcion, "La", "descripcion", "string");
    utils.validarTipoDato(codigo, "El", "codigo", "string");
    utils.validarTipoDato(icono, "El", "icono", "string");
    utils.validarTipoDato(usuarioRegistroId, "El", "usuarioRegistroId", "string");

    nombre = utils.normalizarNombre(nombre);
    descripcion = utils.normalizarCampoOpcional(descripcion);
    codigo = codigo == null ? null : sistemaMethods.construirSlugSistema(codigo, "el código del proceso");
    icono = utils.normalizarString(icono);
    usuarioRegistroId = utils.normalizarString(usuarioRegistroId);

    utils.validarRequerido(moduloId, "El", "moduloId");
    utils.validarRequerido(nombre, "El", "nombre");
    utils.validarRequerido(icono, "El", "icono");
    utils.validarRequerido(usuarioRegistroId, "El", "usuarioRegistroId");
    utils.validarContenidoString(nombre, "El", "nombre");
    utils.validarLongitudString(nombre, "El", "nombre", 80);
    utils.validarLongitudString(icono, "El", "icono", 80);

    if (descripcion != null && descripcion !== "") {
        utils.validarLongitudString(descripcion, "La", "descripcion", 200);
    }

    const codigoFinal = codigo ?? sistemaMethods.construirSlugSistema(nombre, "el nombre del proceso");

    return {
        moduloId,
        nombre,
        descripcion,
        codigo: codigoFinal,
        icono,
        usuarioRegistroId,
        nombreNormalizado: utils.normalizarString(nombre).toLowerCase(),
    };
};

export const validarModuloProceso = async (moduloId) => modulosMethods.validarModuloActivo(moduloId);

export const validarProcesoActivo = async (procesoId) => {
    const proceso = await buscarProcesoPorId(procesoId);

    if (!proceso || proceso.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Process not found.",
            customMessage: "El proceso indicado no existe o está inactivo.",
            statusCode: 404,
            code: "PROCESO_NO_ENCONTRADO",
        });
    }

    return proceso;
};

export const validarDuplicadoProceso = async (collection, { fkModuloId, codigo, url, nombreNormalizado }) => {
    const existente = await collection.findOne({
        $or: [
            { fkModuloId, codigo },
            { url },
            { ruta: `/${url}` },
            { fkModuloId, nombreNormalizado },
        ],
    });

    if (!existente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Process already exists.",
        customMessage: "Ya existe un proceso con el mismo nombre, código o ruta.",
        statusCode: 409,
        code: "PROCESO_DUPLICADO",
    });
};

export const construirDocumentoNuevoProceso = ({ nombre, descripcion, codigo, icono, nombreNormalizado, fkModuloId, moduloNombre, moduloTipo, usuarioRegistroObjectId }) => {
    const fechaActual = new Date();
    const ruta = sistemaMethods.construirRutaJerarquicaProceso({
        tipo: moduloTipo,
        moduloNombre,
        procesoNombre: nombre,
    });
    const url = ruta.startsWith("/") ? ruta.slice(1) : ruta;

    return {
        nombre,
        descripcion: descripcion === "" ? null : (descripcion ?? null),
        codigo,
        icono,
        url,
        nombreNormalizado,
        fkModuloId,
        usuarioRegistroId: usuarioRegistroObjectId,
        estado: true,
        fechaRegistro: fechaActual,
        fechaActualizacion: fechaActual,
    };
};

export const construirRespuestaProceso = (proceso, modulo = null) => ({
    ...sistemaMethods.construirRutaRespuestaProceso({ modulo, proceso }),
    id: proceso._id.toString(),
    moduloId: proceso.fkModuloId?.toString?.() ?? null,
    modulo: modulo?.nombre ?? null,
    moduloCodigo: modulo?.codigo ?? null,
    nombre: proceso.nombre,
    descripcion: proceso.descripcion ?? null,
    codigo: proceso.codigo,
    icono: proceso.icono ?? null,
    estado: proceso.estado ?? true,
    usuarioRegistroId: proceso.usuarioRegistroId?.toString?.() ?? null,
    fechaRegistro: utils.formatearFecha(proceso.fechaRegistro),
    fechaActualizacion: utils.formatearFecha(proceso.fechaActualizacion),
});
