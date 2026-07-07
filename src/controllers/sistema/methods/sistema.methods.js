import { APP_BASE_URL } from "../../../config.js";
import * as utils from "../../../utils/methods.js";
import * as organizacionMethods from "./organizacion.methods.js";

const limpiarSegmento = (valor) => utils
    .normalizarString(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const construirSlugPermiso = (valor, etiqueta) => {
    const slug = limpiarSegmento(valor).replace(/-/g, "");

    if (!slug) {
        throw utils.crearErrorAplicacion({
            message: `Invalid code for ${etiqueta}.`,
            customMessage: `No se pudo generar un código válido para ${etiqueta}.`,
            statusCode: 422,
            code: "INVALID_CODE",
        });
    }

    return slug;
};

export const normalizarRutaProceso = (ruta = null) => {
    utils.validarTipoDato(ruta, "La", "ruta", "string");

    const rutaNormalizada = utils.normalizarString(ruta);
    utils.validarRequerido(rutaNormalizada, "La", "ruta");

    let rutaLimpia = rutaNormalizada.replace(/^https?:\/\/[^/]+/i, "");

    if (!rutaLimpia.startsWith("/")) {
        rutaLimpia = `/${rutaLimpia}`;
    }

    rutaLimpia = rutaLimpia.replace(/\/+/g, "/");

    if (!/^\/[a-zA-Z0-9/_-]+$/.test(rutaLimpia)) {
        throw utils.crearErrorAplicacion({
            message: "Invalid process route.",
            customMessage: "La ruta del proceso debe tener formato como /sistema/modulo/proceso.",
            statusCode: 422,
            code: "INVALID_PROCESS_ROUTE",
        });
    }

    return rutaLimpia;
};

export const resolverTipoRutaProceso = (tipo = null) => {
    const tipoNormalizado = utils.normalizarCampoOpcional(tipo)?.toLowerCase() ?? null;

    if (tipoNormalizado === "gestion") {
        return "gestion";
    }

    if (tipoNormalizado === "sistema" || tipoNormalizado === "sistemas") {
        return "sistema";
    }

    throw utils.crearErrorAplicacion({
        message: "Unsupported route type.",
        customMessage: "El tipo del módulo no es válido para construir la ruta final del proceso.",
        statusCode: 422,
        code: "UNSUPPORTED_PROCESS_ROUTE_TYPE",
    });
};

export const construirRutaJerarquicaProceso = ({ tipo, moduloNombre, procesoNombre }) => {
    const tipoRuta = resolverTipoRutaProceso(tipo);
    const moduloSegmento = limpiarSegmento(moduloNombre);
    const procesoSegmento = limpiarSegmento(procesoNombre);

    if (!moduloSegmento || !procesoSegmento) {
        throw utils.crearErrorAplicacion({
            message: "Invalid route segments.",
            customMessage: "No se pudo construir la ruta final del proceso con el módulo y proceso indicados.",
            statusCode: 422,
            code: "INVALID_PROCESS_ROUTE_SEGMENTS",
        });
    }

    return `/${tipoRuta}/${moduloSegmento}/${procesoSegmento}`;
};

export const construirRutaRespuestaProceso = ({ modulo, proceso }) => {
    try {
        const ruta = construirRutaJerarquicaProceso({
            tipo: modulo?.tipo,
            moduloNombre: modulo?.nombre,
            procesoNombre: proceso?.nombre,
        });

        return {
            url: ruta.slice(1),
        };
    } catch (_error) {
        return {
            url: proceso?.url ?? (proceso?.ruta?.startsWith("/") ? proceso.ruta.slice(1) : proceso?.ruta ?? null),
        };
    }
};

export const construirUrlProceso = (ruta) => {
    const baseUrl = APP_BASE_URL.replace(/\/+$/, "");
    return `${baseUrl}${ruta}`;
};

export const construirClavesPermisoProceso = ({ moduloCodigo, procesoCodigo }) => {
    return {
        lectura: `sistema.${moduloCodigo}.${procesoCodigo}.read`,
        escritura: `sistema.${moduloCodigo}.${procesoCodigo}.write`,
    };
};

export const construirPermisosAccesoProceso = ({ modulo, proceso, tipoPermiso }) => {
    const permisosProceso = construirClavesPermisoProceso({
        moduloCodigo: modulo?.codigo,
        procesoCodigo: proceso?.codigo,
    });

    return tipoPermiso === 0
        ? [permisosProceso.lectura]
        : [permisosProceso.lectura, permisosProceso.escritura];
};

export const validarUsuarioCreadorSistema = async (payload) => organizacionMethods.validarUsuarioRegistro(payload);
export const construirSlugSistema = construirSlugPermiso;