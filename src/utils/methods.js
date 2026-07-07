import {
    DB_COLLECTION_SESIONES,
    SESSION_INACTIVITY_MINUTES,
    SESSION_MAX_ACTIVE,
    SESSION_RENEWAL_THRESHOLD_MINUTES,
} from "../config.js";
import { getCollection } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ObjectId } from "mongodb";

function crearErrorValidacion(message, customMessage, { statusCode = 422, code = "VALIDATION_ERROR", details = null } = {}) {
    const error = new Error(message);
    error.customMessage = customMessage;
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
}

// ------------------------------------------------------- [VALIDACIONES BASICAS]
export const validarRequerido = (campo, prefijo, valor) => {
    if (!campo) {
        throw crearErrorValidacion(`The ${valor} is required.`, `${prefijo} ${valor} es requerido.`);
    }
};
export const validarContenidoString = (campo, prefijo, valor) => {
    if (typeof campo === "string") {
        const contieneNumeros = /\d/.test(campo);

        if (contieneNumeros) {
            throw crearErrorValidacion(`The ${valor} must not contain numeric characters.`, `${prefijo} ${valor} no debe tener caracteres numéricos.`);
        }
    }
};
export const validarRequeridoEdicion = (campo, prefijo, valor) => {
    if (campo === "") {
        throw crearErrorValidacion(`The ${valor} is required.`, `${prefijo} ${valor} es requerido.`);
    }
};
export const validarLongitudString = (campo, tipo, valor, len) => {
    if (campo && campo.length > len) {
        throw crearErrorValidacion(`The ${valor} must have a maximum of ${len} characters.`, `${tipo} ${valor} solo puede tener un maximo de ${len} caracteres.`);
    }
};

// ------------------------------------------------------- [VALIDACIONES DE FORMATO]
export const validarFormatoEmail = (email) => {
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !regexEmail.test(email)) {
        throw crearErrorValidacion(`Invalid email format.`, `El correo electrónico proporcionado no es válido.`);
    }
};
export const validarFormatoTelefono = (telefono) => {
    if (!telefono) {
        return; 
    }

    const regexTelefono = /^[0-9]{10}$/;

    if (!regexTelefono.test(telefono)) {
        throw crearErrorValidacion(`Invalid phone format.`, `El teléfono proporcionado no es válido. Debe tener 10 dígitos.`);
    }
};

// ------------------------------------------------------- [VALIDACIONES DE TIPO]
export const validarTipoDato = (campo, prefijo, valor, tipo) => {
    const tiposValidos = {
        string: (valor) => valor === null || typeof valor === "string",
        int: (valor) => valor === null || Number.isInteger(valor),
        float: (valor) => valor === null || (typeof valor === "number" && !Number.isInteger(valor)),
        object: (valor) => valor === null || (typeof valor === "object" && !Array.isArray(valor)),
        array: (valor) => valor === null || Array.isArray(valor),
        bool: (valor) => valor === null || typeof valor === "boolean"
    };

    if (!tiposValidos[tipo]) {
        throw new Error(`Invalid type "${valor}". Allowed types: ${Object.keys(tiposValidos).join(", ")}`);
    }

    if (!tiposValidos[tipo](campo)) {
        throw crearErrorValidacion(`The ${valor} does not have the correct format.`, `${prefijo} ${valor} no tiene el formato adecuado.`);
    }
};

// ------------------------------------------------------- [NORMALIZACION DE TEXTO]
export const limpiarEspacios = (texto) => {
    return texto != null ? texto.trim() : null;
};

export const normalizarString = (valor) => limpiarEspacios(valor);

export const normalizarCampoOpcional = (valor, normalizer = normalizarString) => {
    if (valor == null) {
        return null;
    }

    const normalizado = normalizer(valor);

    return normalizado === "" ? null : normalizado;
};

export const capitalizarNombre = (texto) => {
    if (texto == null) {
        return; 
    }

    return texto.split(" ").map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()).join(" ");
};

export const capitalizarTexto = (texto) => {
    if (texto == null) {
        return; 
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const normalizarNombre = (valor) => {
    if (valor == null) {
        return null;
    }

    const limpio = normalizarString(valor);

    if (limpio === "") {
        return "";
    }

    return capitalizarNombre(limpio);
};

export const normalizarEmail = (valor) => {
    if (valor == null) {
        return null;
    }

    const limpio = normalizarString(valor);

    if (limpio === "") {
        return "";
    }

    return limpio.toLowerCase();
};

export const escapeRegex = (valor) => valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ------------------------------------------------------- [FORMATEO]
export const formatearFecha = (fecha) => {
    if (!fecha) {
        return null;
    }

    const date = new Date(fecha);

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const año = String(date.getFullYear()).slice(-4); // Tomamos solo los últimos dos dígitos del año

    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, "0");

    const ampm = horas >= 12 ? "pm" : "am";

    horas = horas % 12;
    horas = horas ? String(horas).padStart(2, "0") : "12"; // El 0 se convierte en 12

    return `${año}/${mes}/${dia} ${horas}:${minutos} ${ampm}`;
};

export const crearRespuestaApi = ({ success = true, message = null, error = null, data = null, ...extra } = {}) => {
    return {
        success,
        message,
        error,
        data,
        ...extra,
    };
};

export const crearRespuestaErrorApi = (error, { message = "Ocurrió un error en el servidor", ...extra } = {}) => {
    return crearRespuestaApi({
        success: false,
        message: error.customMessage ?? (error.code === 11000 ? "Lo sentimos pero ya existe un usuario con la misma informacion." : message),
        error: error.message,
        ...(error?.details ? { details: error.details } : {}),
        ...extra,
    });
};

export const obtenerStatusCodeError = (error) => {
    if (error?.statusCode) {
        return error.statusCode;
    }

    if (error?.code === 11000) {
        return 409;
    }

    return 500;
};

export const crearErrorAplicacion = ({ message, customMessage = null, statusCode = 400, code = null, details = null }) => {
    const error = new Error(message);
    error.customMessage = customMessage ?? message;
    error.statusCode = statusCode;
    error.code = code ?? error.code;
    error.details = details;
    return error;
};

// ------------------------------------------------------- [CRIPTOGRAFIA]
export const generarHash = (password) => {
    if (!password) {
        return; 
    }
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}
export const compararHash = (password, hash) => {
    return bcrypt.compare(password, hash);
}

// ------------------------------------------------------- [MONGO GENERICO]
export const validarObjectId = (value, prefijo, campo, requerido = false) => {
    if (value == null || value === "") {
        if (requerido) {
            validarRequerido(value, prefijo, campo);
        }

        return null;
    }

    if (value instanceof ObjectId) {
        return value;
    }

    if (typeof value !== "string") {
        throw crearErrorValidacion(`The ${campo} does not have the correct format.`, `${prefijo} ${campo} no tiene el formato adecuado.`);
    }

    const limpio = value.trim();

    if (!ObjectId.isValid(limpio)) {
        throw crearErrorValidacion(`Invalid ObjectId for ${campo}.`, `${prefijo} ${campo} no es un identificador valido.`);
    }

    return new ObjectId(limpio);
};

export const construirFiltroFecha = (campo, value, prefijo, etiqueta) => {
    if (value == null || value === "") {
        return null;
    }

    validarTipoDato(value, prefijo, etiqueta, "string");

    const fecha = new Date(value);

    if (Number.isNaN(fecha.getTime())) {
        throw crearErrorValidacion(`Invalid date for ${etiqueta}.`, `${prefijo} ${etiqueta} no tiene un formato de fecha valido.`);
    }

    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    return { [campo]: { $gte: inicio, $lte: fin } };
};

// ------------------------------------------------------- [UTILIDADES DE USUARIO]
export const generarUsuario = (nombre, apellido) => {
    const primerNombre = nombre.split(" ")[0] ?? "";
    const primerApellido = apellido.split(" ")[0] ?? "";

    const nombreLimpio = primerNombre.replace(/\s+/g, "").toLowerCase();
    const apellidoLimpio = primerApellido.replace(/\s+/g, "").toLowerCase();

    const fecha = new Date();
    const fechaFormato = `${fecha.getMonth() + 1}${fecha.getDate()}${fecha.getFullYear() % 100}${fecha.getHours()}${fecha.getMinutes()}${fecha.getSeconds()}${fecha.getMilliseconds()}`;
    const sufijoAleatorio = crypto.randomBytes(2).toString("hex");

    return `${nombreLimpio}.${apellidoLimpio}.${fechaFormato}${sufijoAleatorio}`;
};

export const getSesionesCollection = async () => getCollection(DB_COLLECTION_SESIONES);

export const construirRespuestaSesion = async (sesion, { includeToken = false } = {}) => {
    return {
        id: sesion._id.toString(),
        fkUsuarioId: sesion.fkUsuarioId?.toString?.() ?? null,
        ...(includeToken ? { token: sesion.token } : {}),
        dispositivo: sesion.dispositivo ?? null,
        userAgent: sesion.userAgent ?? null,
        ip: sesion.ip ?? null,
        navegador: sesion.navegador ?? null,
        sistemaOperativo: sesion.sistemaOperativo ?? null,
        tipoDispositivo: sesion.tipoDispositivo ?? null,
        idioma: sesion.idioma ?? null,
        origen: sesion.origen ?? null,
        sessionStart: formatearFecha(sesion.sessionStart),
        sessionExpiry: formatearFecha(sesion.sessionExpiry),
        estado: sesion.estado ?? true,
    };
};


export const validarNoVacioSiEnviado = (campo, prefijo, valor) => {
    if (campo === "") {
        throw crearErrorValidacion(`The ${valor} must not be empty.`, `${prefijo} ${valor} no puede estar vacio.`);
    }
};

// ------------------------------------------------------- [UTILIDADES DE SESION]
export const generarTokenSesion = () => crypto.randomBytes(48).toString("hex");

export const calcularExpiracionSesion = (minutos = SESSION_INACTIVITY_MINUTES) => {
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + minutos);
    return expiracion;
};

export const renovarExpiracionSesion = async (sesionId, minutos = SESSION_INACTIVITY_MINUTES) => {
    const sesionesCollection = await getSesionesCollection();
    const sessionExpiry = calcularExpiracionSesion(minutos);
    const fechaActualizacion = new Date();

    await sesionesCollection.updateOne(
        { _id: sesionId },
        {
            $set: {
                sessionExpiry,
                fechaActualizacion,
            },
        }
    );

    return {
        sessionExpiry,
        fechaActualizacion,
    };
};

export const debeRenovarSesion = (sessionExpiry, thresholdMinutes = SESSION_RENEWAL_THRESHOLD_MINUTES) => {
    if (!sessionExpiry) {
        return false;
    }

    const restanteMs = new Date(sessionExpiry).getTime() - Date.now();
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return restanteMs <= thresholdMs;
};

export const validarCredencialesSesion = ({ usuario = null, password = null, token = null, dispositivo = null, sistemaOperativo = null }, { requiereToken = false } = {}) => {
    validarTipoDato(usuario, "El", "usuario", "string");
    validarTipoDato(password, "La", "contraseña", "string");
    validarTipoDato(dispositivo, "El", "dispositivo", "string");
    validarTipoDato(sistemaOperativo, "El", "sistema operativo", "string");

    if (requiereToken) {
        validarTipoDato(token, "El", "token", "string");
        validarRequerido(token, "El", "token");
        return;
    }

    validarRequerido(usuario, "El", "usuario");
    validarRequerido(password, "La", "contraseña");
};

export const normalizarUsuarioSesion = (usuario) => {
    const valor = normalizarString(usuario);

    if (!valor) {
        return valor;
    }

    return valor.toLowerCase();
};

export const resolverDispositivoSesion = (dispositivo, userAgent = null) => {
    const dispositivoNormalizado = normalizarString(dispositivo);
    const userAgentNormalizado = normalizarString(userAgent);

    if (dispositivoNormalizado) {
        return dispositivoNormalizado;
    }

    if (userAgentNormalizado) {
        return userAgentNormalizado;
    }

    return "Dispositivo no identificado";
};

export const resolverTipoDispositivo = (userAgent = "") => {
    const agent = (userAgent || "").toLowerCase();

    if (/tablet|ipad/.test(agent)) {
        return "tablet";
    }
    if (/mobile|android|iphone/.test(agent)) {
        return "movil";
    }

    return "pc";
};

export const resolverSistemaOperativo = (userAgent = "") => {
    const agent = userAgent || "";

    if (/Windows NT/i.test(agent)) {
        return "Windows";
    }
    if (/Mac OS X|Macintosh/i.test(agent)) {
        return "macOS";
    }
    if (/Android/i.test(agent)) {
        return "Android";
    }
    if (/iPhone|iPad|iOS/i.test(agent)) {
        return "iOS";
    }
    if (/Linux/i.test(agent)) {
        return "Linux";
    }

    return "Desconocido";
};

export const resolverSistemaOperativoSesion = (sistemaOperativo = null, userAgent = "") => {
    const sistemaOperativoNormalizado = normalizarString(sistemaOperativo);

    if (sistemaOperativoNormalizado) {
        return sistemaOperativoNormalizado;
    }

    return resolverSistemaOperativo(userAgent);
};

export const resolverNavegador = (userAgent = "") => {
    const agent = userAgent || "";

    if (/Edg\//i.test(agent)) {
        return "Edge";
    }
    if (/OPR\//i.test(agent) || /Opera/i.test(agent)) {
        return "Opera";
    }
    if (/Chrome\//i.test(agent) && !/Edg\//i.test(agent) && !/OPR\//i.test(agent)) {
        return "Chrome";
    }
    if (/Firefox\//i.test(agent)) {
        return "Firefox";
    }
    if (/Safari\//i.test(agent) && !/Chrome\//i.test(agent)) {
        return "Safari";
    }

    return "Desconocido";
};

export const extraerIpCliente = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim() !== "") {
        return forwardedFor.split(",")[0].trim();
    }

    return req.ip ?? req.socket?.remoteAddress ?? null;
};

export const construirMetadataSesion = (req, { dispositivo = null, sistemaOperativo = null } = {}) => {
    const userAgent = normalizarString(req.headers["user-agent"] ?? null);
    const acceptLanguage = normalizarString(req.headers["accept-language"] ?? null);
    const origen = normalizarString(req.headers.origin ?? req.headers.referer ?? null);

    return {
        dispositivo: resolverDispositivoSesion(dispositivo, userAgent),
        userAgent,
        ip: normalizarString(extraerIpCliente(req)),
        navegador: resolverNavegador(userAgent),
        sistemaOperativo: resolverSistemaOperativoSesion(sistemaOperativo, userAgent),
        tipoDispositivo: resolverTipoDispositivo(userAgent),
        idioma: acceptLanguage ? acceptLanguage.split(",")[0] : null,
        origen,
    };
};

export const crearDocumentoSesion = ({ usuarioId, metadata = {} }) => {
    const ahora = new Date();

    return {
        fkUsuarioId: usuarioId,
        dispositivo: metadata.dispositivo ?? "Dispositivo no identificado",
        userAgent: metadata.userAgent ?? null,
        ip: metadata.ip ?? null,
        navegador: metadata.navegador ?? null,
        sistemaOperativo: metadata.sistemaOperativo ?? null,
        tipoDispositivo: metadata.tipoDispositivo ?? null,
        idioma: metadata.idioma ?? null,
        origen: metadata.origen ?? null,
        token: generarTokenSesion(),
        sessionStart: ahora,
        sessionExpiry: calcularExpiracionSesion(),
        estado: true,
        fechaRegistro: ahora,
        fechaActualizacion: ahora,
    };
};

export const obtenerSesionActivaPorToken = async (token) => {
    const sesionesCollection = await getSesionesCollection();

    return sesionesCollection.findOne({
        token,
        sessionExpiry: { $gt: new Date() },
    });
};

export const eliminarSesionActiva = async (sesionId) => {
    const sesionesCollection = await getSesionesCollection();

    await sesionesCollection.deleteOne({ _id: sesionId });
};

export const usuarioTieneSesionesActivas = async (usuarioId) => {
    const sesionesCollection = await getSesionesCollection();
    const sesionesActivas = await sesionesCollection.countDocuments({
        fkUsuarioId: usuarioId,
        sessionExpiry: { $gt: new Date() },
    });

    return sesionesActivas > 0;
};

export const depurarSesionesExpiradasUsuario = async (usuarioId) => {
    const sesionesCollection = await getSesionesCollection();

    await sesionesCollection.deleteMany(
        {
            fkUsuarioId: usuarioId,
            sessionExpiry: { $lte: new Date() },
        }
    );
};

export const eliminarSesionesUsuario = async (usuarioId) => {
    const sesionesCollection = await getSesionesCollection();

    await sesionesCollection.deleteMany({
        fkUsuarioId: usuarioId,
    });
};

export const cerrarSesionesActivasPorDispositivo = async (usuarioId, dispositivo) => {
    const sesionesCollection = await getSesionesCollection();

    await sesionesCollection.updateMany(
        {
            fkUsuarioId: usuarioId,
            sessionExpiry: { $gt: new Date() },
            dispositivo,
        },
        {
            $set: {
                estado: false,
                fechaActualizacion: new Date(),
            },
        }
    );
};

export const obtenerSesionesActivasUsuario = async (usuarioId) => {
    const sesionesCollection = await getSesionesCollection();

    return sesionesCollection.find(
        {
            fkUsuarioId: usuarioId,
            sessionExpiry: { $gt: new Date() },
        },
        {
            projection: {
                fkUsuarioId: 1,
                token: 1,
                dispositivo: 1,
                userAgent: 1,
                ip: 1,
                sessionStart: 1,
                sessionExpiry: 1,
                estado: 1,
            },
        }
    )
        .sort({ sessionStart: -1, _id: -1 })
        .toArray();
};

export const validarLimiteSesionesUsuario = async (usuarioId) => {
    const sesionesActivas = await obtenerSesionesActivasUsuario(usuarioId);

    if (sesionesActivas.length >= SESSION_MAX_ACTIVE) {
        const error = new Error("Active session limit reached.");
        error.customMessage = `Has llegado al maximo de ${SESSION_MAX_ACTIVE} sesiones activas. Debes cerrar una sesion antes de iniciar otra.`;
        error.activeSessions = sesionesActivas;
        throw error;
    }

    return sesionesActivas;
};

export const obtenerSesionPorToken = async (token) => {
    const sesionesCollection = await getSesionesCollection();
    return sesionesCollection.findOne({ token });
};

export const obtenerSesionPorId = async (sesionId) => {
    const sesionesCollection = await getSesionesCollection();
    return sesionesCollection.findOne({ _id: sesionId });
};

export const extraerTokenSesionRequest = (req) => {
    const authorizationHeader = normalizarString(req.headers.authorization ?? null);
    const customTokenHeader = normalizarString(req.headers["x-session-token"] ?? null);
    const bodyToken = normalizarString(req.body?.token ?? null);

    if (authorizationHeader) {
        if (/^bearer\s+/i.test(authorizationHeader)) {
            return authorizationHeader.replace(/^bearer\s+/i, "").trim();
        }

        return authorizationHeader;
    }

    if (customTokenHeader) {
        return customTokenHeader;
    }

    return bodyToken;
};

export const validarTokenSesionActiva = async (token) => {
    const sesion = await obtenerSesionPorToken(token);

    if (!sesion) {
        const error = new Error("Session not found.");
        error.customMessage = "La sesion indicada no existe.";
        throw error;
    }

    if (sesion.sessionExpiry <= new Date()) {
        await eliminarSesionActiva(sesion._id);
        const usuarioSigueActivo = await usuarioTieneSesionesActivas(sesion.fkUsuarioId);
        await marcarSesionUsuario(sesion.fkUsuarioId, usuarioSigueActivo);

        const error = new Error("Session expired.");
        error.customMessage = "La sesion expiro. Debes iniciar sesion nuevamente.";
        throw error;
    }

    if (!debeRenovarSesion(sesion.sessionExpiry)) {
        return sesion;
    }

    const renovacion = await renovarExpiracionSesion(sesion._id);

    return {
        ...sesion,
        ...renovacion,
    };
};

export const validarCierreSesionSolicitada = async ({ sesionId }) => {
    const objectId = validarObjectId(sesionId, "El", "idSesion", true);
    const sesionActual = await obtenerSesionPorId(objectId);

    if (!sesionActual) {
        const error = new Error("Session not found.");
        error.customMessage = "La sesion que intentas cerrar no existe.";
        throw error;
    }

    if (sesionActual.sessionExpiry <= new Date()) {
        await eliminarSesionActiva(sesionActual._id);

        const error = new Error("Session expired.");
        error.customMessage = "La sesion ya habia expirado y fue eliminada.";
        throw error;
    }

    return sesionActual;
};