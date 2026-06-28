import { DB_COLLECTION_USUARIOS } from "../../../../config.js";
import { getCollection } from "../../../../db.js";
import * as utils from "../../../../utils/methods.js";

export const MAX_USUARIOS_RESULTS = 20;

// Metodo para obtener la coleccion de usuarios desde MongoDB.
export const getUsuariosCollection = async () => getCollection(DB_COLLECTION_USUARIOS);

// Metodo para buscar un usuario por su identificador y validar el ObjectId recibido.
export const buscarUsuarioPorId = async (usuarioId) => {
    const objectId = utils.validarObjectId(usuarioId, "El", "usuarioId", true);
    const usuariosCollection = await getUsuariosCollection();
    return usuariosCollection.findOne({ _id: objectId });
};

// Metodo para buscar un usuario por sus credenciales de acceso usando email o nombre de usuario.
export const buscarUsuarioPorCredencial = async (usuario) => {
    const usuariosCollection = await getUsuariosCollection();
    const credencial = utils.normalizarUsuarioSesion(usuario);

    return usuariosCollection.findOne({
        $or: [
            { email: credencial },
            { usuario: credencial },
        ],
    });
};

// Metodo para actualizar el estado de sesion de un usuario y registrar la fecha de modificacion.
export const marcarSesionUsuario = async (usuarioId, sesionActiva) => {
    const usuariosCollection = await getUsuariosCollection();
    await usuariosCollection.updateOne(
        { _id: usuarioId },
        {
            $set: {
                sesion: sesionActiva,
                fechaActualizacion: new Date(),
            },
        }
    );
};

// Metodo para construir la respuesta detallada de un usuario para la API.
export const construirRespuestaUsuario = async (usuario) => {
    return {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        usuario: usuario.usuario,
        email: usuario.email,
        telefono: usuario.telefono ?? null,
        fechaRegistro: utils.formatearFecha(usuario.fechaRegistro),
        fechaActualizacion: utils.formatearFecha(usuario.fechaActualizacion),
        estado: usuario.estado ?? true,
        sesion: usuario.sesion ?? false,
    };
};

// Metodo para transformar una lista de usuarios en su formato de respuesta de API.
export const construirRespuestaUsuarios = async (usuarios) => Promise.all(usuarios.map(construirRespuestaUsuario));

// Metodo para construir la respuesta resumida de un usuario para catalogos o formularios.
export const construirRespuestaCatalogoUsuario = async (usuario) => {
    const respuesta = await construirRespuestaUsuario(usuario);

    return {
        id: respuesta.id,
        nombre: `${respuesta.nombre}`.trim(),
        apellido: `${respuesta.apellido}`.trim(),
        usuario: `${respuesta.usuario}`.trim(),
        email: `${respuesta.email}`.trim(),
    };
};

// Metodo para transformar una lista de usuarios en formato resumido para catalogos.
export const construirRespuestaCatalogoUsuarios = async (usuarios) => Promise.all(usuarios.map(construirRespuestaCatalogoUsuario));

// Metodo para construir una respuesta estandar cuando no se encuentra un usuario por id.
export const construirRespuestaUsuarioNoEncontrado = (usuarioId) => {
    return utils.crearRespuestaApi({
        success: false,
        message: `No se encontro el usuario con id '${usuarioId}'.`,
        error: `No record found for id '${usuarioId}' in collection 'usuarios'.`,
        data: null,
    });
};

// Metodo para validar si ya existe otro usuario con el mismo email o nombre de usuario.
export const validarDuplicadoUsuario = async (collection, { email, usuario, excludeId = null }) => {
    const condiciones = [];

    if (email) {
        condiciones.push({ email });
    }
    if (usuario) {
        condiciones.push({ usuario });
    }

    if (condiciones.length === 0) {
        return;
    }

    const filtro = { $or: condiciones };

    if (excludeId) {
        filtro._id = { $ne: excludeId };
    }

    const existente = await collection.findOne(filtro);

    if (!existente) {
        return;
    }

    const error = utils.crearErrorAplicacion({
        message: "Usuario duplicado.",
        customMessage: "Lo sentimos pero ya existe un usuario con la misma informacion.",
        statusCode: 409,
        code: "USER_DUPLICATE",
    });

    if (email && existente.email === email) {
        error.customMessage = "Lo sentimos pero el correo ya esta en uso por otro usuario.";
    }

    throw error;
};

// Metodo para validar los campos base del usuario segun el contexto de registro o edicion.
export const validarCamposBaseUsuario = ({
    nombre = null,
    apellido = null,
    email = null,
    telefono = null,
    password = null,
} = {}, { requierePassword = false } = {}) => {
    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(apellido, "El", "apellido", "string");
    utils.validarTipoDato(email, "El", "email", "string");
    utils.validarTipoDato(telefono, "El", "telefono", "string");
    utils.validarTipoDato(password, "La", "contraseña", "string");

    if (nombre != null) {
        utils.validarContenidoString(nombre, "El", "nombre");
    }
    if (apellido != null) {
        utils.validarContenidoString(apellido, "El", "apellido");
    }

    if (requierePassword) {
        utils.validarRequerido(password, "La", "contraseña");
    }

    if (nombre != null && nombre !== "") {
        utils.validarLongitudString(nombre, "El", "nombre", 50);
    }
    if (apellido != null && apellido !== "") {
        utils.validarLongitudString(apellido, "El", "apellido", 50);
    }
    if (email != null && email !== "") {
        utils.validarLongitudString(email, "El", "email", 100);
        utils.validarFormatoEmail(email);
    }
    if (telefono != null && telefono !== "") {
        utils.validarLongitudString(telefono, "El", "telefono", 10);
        utils.validarFormatoTelefono(telefono);
    }
    if (password != null && password !== "") {
        if (password.length < 8) {
            throw utils.crearErrorAplicacion({
                message: "Password too short.",
                customMessage: "La contraseña debe tener al menos 8 caracteres.",
                statusCode: 422,
                code: "VALIDATION_ERROR",
            });
        }
        utils.validarLongitudString(password, "La", "contraseña", 64);

        if (!/[a-z]/.test(password)) {
            throw utils.crearErrorAplicacion({
                message: "Password must include a lowercase letter.",
                customMessage: "La contraseña debe incluir al menos una letra minúscula.",
                statusCode: 422,
                code: "VALIDATION_ERROR",
            });
        }
        if (!/[A-Z]/.test(password)) {
            throw utils.crearErrorAplicacion({
                message: "Password must include an uppercase letter.",
                customMessage: "La contraseña debe incluir al menos una letra mayúscula.",
                statusCode: 422,
                code: "VALIDATION_ERROR",
            });
        }
        if (!/\d/.test(password)) {
            throw utils.crearErrorAplicacion({
                message: "Password must include a number.",
                customMessage: "La contraseña debe incluir al menos un número.",
                statusCode: 422,
                code: "VALIDATION_ERROR",
            });
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            throw utils.crearErrorAplicacion({
                message: "Password must include a special character.",
                customMessage: "La contraseña debe incluir al menos un carácter especial.",
                statusCode: 422,
                code: "VALIDATION_ERROR",
            });
        }
    }
};

// Metodo para resolver los nombres soportados del payload cuando se solicita un cambio de contraseña.
export const resolverCambioPasswordPayload = (payload = {}) => {
    const currentPassword = payload.currentPassword
        ?? payload.passwordActual
        ?? payload.passwordactual
        ?? null;

    const newPassword = payload.newPassword
        ?? payload.passwordNueva
        ?? payload.passworNueva
        ?? null;

    return {
        currentPassword,
        newPassword,
    };
};

// Metodo para validar el cambio de contraseña comparando la contraseña actual y aplicando reglas de seguridad.
export const validarCambioPassword = async ({ currentPassword, newPassword, usuarioActual }) => {
    const solicitaCambio = currentPassword != null || newPassword != null;

    if (!solicitaCambio) {
        return null;
    }

    utils.validarTipoDato(currentPassword, "La", "contraseña actual", "string");
    utils.validarTipoDato(newPassword, "La", "nueva contraseña", "string");
    utils.validarNoVacioSiEnviado(currentPassword, "La", "contraseña actual");
    utils.validarNoVacioSiEnviado(newPassword, "La", "nueva contraseña");
    utils.validarRequerido(currentPassword, "La", "contraseña actual");
    utils.validarRequerido(newPassword, "La", "nueva contraseña");
    validarCamposBaseUsuario({ password: newPassword });

    const passwordActualValida = await utils.compararHash(currentPassword, usuarioActual.password);

    if (!passwordActualValida) {
        throw utils.crearErrorAplicacion({
            message: "Current password is incorrect.",
            customMessage: "La contraseña actual es incorrecta.",
            statusCode: 422,
            code: "INVALID_CURRENT_PASSWORD",
        });
    }

    if (currentPassword === newPassword) {
        throw utils.crearErrorAplicacion({
            message: "New password must be different from current password.",
            customMessage: "La nueva contraseña debe ser diferente a la actual.",
            statusCode: 422,
            code: "PASSWORD_REUSE",
        });
    }

    return newPassword;
};

// Metodo para normalizar y validar el payload requerido para registrar un nuevo usuario.
export const prepararRegistroUsuario = (payload = {}) => {
    let {
        nombre = null,
        apellido = null,
        telefono = null,
        email = null,
        password = null,
    } = payload;

    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(apellido, "El", "apellido", "string");
    utils.validarTipoDato(email, "El", "email", "string");
    utils.validarTipoDato(password, "La", "contraseña", "string");
    utils.validarTipoDato(telefono, "El", "telefono", "string");

    nombre = utils.normalizarNombre(nombre);
    apellido = utils.normalizarNombre(apellido);
    telefono = utils.normalizarCampoOpcional(telefono);
    email = utils.normalizarEmail(email);
    password = utils.normalizarString(password);

    utils.validarRequerido(nombre, "El", "nombre");
    utils.validarRequerido(apellido, "El", "apellido");
    utils.validarRequerido(email, "El", "email");
    utils.validarRequerido(password, "La", "contraseña");
    validarCamposBaseUsuario({ nombre, apellido, email, telefono, password }, { requierePassword: true });

    return {
        nombre,
        apellido,
        telefono,
        email,
        password,
    };
};

// Metodo para construir el documento de un nuevo usuario listo para persistirse en MongoDB.
export const construirDocumentoNuevoUsuario = async ({ nombre, apellido, telefono, email, password }) => {
    const fechaActual = new Date();

    return {
        nombre,
        apellido,
        telefono,
        usuario: utils.generarUsuario(nombre, apellido),
        email,
        password: await utils.generarHash(password),
        estado: true,
        sesion: false,
        fechaRegistro: fechaActual,
        fechaActualizacion: fechaActual,
    };
};

// Metodo para normalizar y validar el payload permitido para editar un usuario existente.
export const prepararEdicionUsuario = (payload = {}) => {
    let {
        nombre = null,
        apellido = null,
        email = null,
        telefono = null,
        estado = null,
        sesion = null,
    } = payload;
    let { currentPassword, newPassword } = resolverCambioPasswordPayload(payload);

    utils.validarTipoDato(estado, "El", "estado", "bool");
    utils.validarTipoDato(sesion, "La", "sesion", "bool");

    if (sesion === true) {
        throw utils.crearErrorAplicacion({
            message: "Session state cannot be set to true from editarUsuario.",
            customMessage: "La sesión solo puede cambiarse a false desde este endpoint. Para iniciarla debes usar el endpoint de iniciar sesión.",
            statusCode: 422,
            code: "INVALID_SESSION_STATE",
        });
    }

    nombre = nombre == null ? null : utils.normalizarNombre(nombre);
    apellido = apellido == null ? null : utils.normalizarNombre(apellido);
    email = email == null ? null : utils.normalizarEmail(email);
    telefono = telefono == null ? null : (utils.normalizarString(telefono) === "" ? "" : utils.normalizarString(telefono));
    currentPassword = currentPassword == null ? null : utils.normalizarString(currentPassword);
    newPassword = newPassword == null ? null : utils.normalizarString(newPassword);

    utils.validarNoVacioSiEnviado(nombre, "El", "nombre");
    utils.validarNoVacioSiEnviado(apellido, "El", "apellido");
    utils.validarNoVacioSiEnviado(email, "El", "email");
    validarCamposBaseUsuario({ nombre, apellido, email, telefono });

    return {
        nombre,
        apellido,
        email,
        telefono,
        currentPassword,
        newPassword,
        estado,
        sesion,
    };
};

// Metodo para construir el objeto de actualizaciones que se enviara a MongoDB al editar un usuario.
export const construirActualizacionesUsuario = async (payloadEditado, usuarioActual) => {
    const {
        nombre,
        apellido,
        email,
        telefono,
        newPassword,
        estado,
        sesion,
    } = payloadEditado;

    const actualizaciones = {};

    if (nombre != null) {
        actualizaciones.nombre = nombre;
    }
    if (apellido != null) {
        actualizaciones.apellido = apellido;
    }
    if (email != null) {
        actualizaciones.email = email;
    }
    if (telefono != null) {
        actualizaciones.telefono = telefono === "" ? null : telefono;
    }
    if (estado != null) {
        actualizaciones.estado = estado;
    }
    if (sesion != null) {
        actualizaciones.sesion = sesion;
    }
    if (newPassword != null) {
        actualizaciones.password = await utils.generarHash(newPassword);
    }

    const nombreBase = actualizaciones.nombre ?? usuarioActual.nombre;
    const apellidoBase = actualizaciones.apellido ?? usuarioActual.apellido;

    if (actualizaciones.nombre || actualizaciones.apellido) {
        actualizaciones.usuario = utils.generarUsuario(nombreBase, apellidoBase);
    }

    if (Object.keys(actualizaciones).length === 0) {
        throw utils.crearErrorAplicacion({
            message: "No changes supplied.",
            customMessage: "Debes enviar al menos un campo para editar.",
            statusCode: 422,
            code: "NO_CHANGES_SUPPLIED",
        });
    }

    actualizaciones.fechaActualizacion = new Date();

    return actualizaciones;
};

// Metodo para construir el filtro liviano del formulario de busqueda de usuarios.
export const construirFiltroFormularioUsuarios = (payload = {}) => {
    let { nombre = null } = payload;

    utils.validarTipoDato(nombre, "El", "nombre", "string");

    nombre = utils.normalizarString(nombre);

    const filtro = {
        estado: true,
    };

    if (!nombre) {
        return filtro;
    }

    const nombreBusqueda = { $regex: utils.escapeRegex(nombre), $options: "i" };

    filtro.$or = [
        { nombre: nombreBusqueda },
        { apellido: nombreBusqueda },
        { usuario: nombreBusqueda },
        { email: nombreBusqueda },
    ];

    return filtro;
};

// Metodo para construir el filtro avanzado de consulta de usuarios con multiples criterios.
export const construirFiltroUsuarios = (payload = {}) => {
    let {
        id = null,
        nombre = null,
        apellido = null,
        usuario = null,
        email = null,
        telefono = null,
        fechaRegistro = null,
        fechaActualizacion = null,
        estado = null,
        sesion = null,
    } = payload;

    utils.validarTipoDato(nombre, "El", "nombre", "string");
    utils.validarTipoDato(apellido, "El", "apellido", "string");
    utils.validarTipoDato(usuario, "El", "usuario", "string");
    utils.validarTipoDato(email, "El", "email", "string");
    utils.validarTipoDato(telefono, "El", "telefono", "string");
    utils.validarTipoDato(estado, "El", "estado", "bool");
    utils.validarTipoDato(sesion, "La", "sesion", "bool");

    const filtros = [];

    const objectId = utils.validarObjectId(id, "El", "id");
    if (objectId) {
        filtros.push({ _id: objectId });
    }

    nombre = utils.normalizarString(nombre);
    apellido = utils.normalizarString(apellido);
    usuario = utils.normalizarString(usuario);
    email = utils.normalizarEmail(email);
    telefono = utils.normalizarString(telefono);

    if (nombre) {
        filtros.push({ nombre: { $regex: utils.escapeRegex(nombre), $options: "i" } });
    }
    if (apellido) {
        filtros.push({ apellido: { $regex: utils.escapeRegex(apellido), $options: "i" } });
    }
    if (usuario) {
        filtros.push({ usuario: { $regex: utils.escapeRegex(usuario), $options: "i" } });
    }
    if (email) {
        filtros.push({ email: { $regex: utils.escapeRegex(email), $options: "i" } });
    }
    if (telefono) {
        filtros.push({ telefono: { $regex: utils.escapeRegex(telefono), $options: "i" } });
    }

    const fechaRegistroFiltro = utils.construirFiltroFecha("fechaRegistro", fechaRegistro, "La", "fechaRegistro");
    const fechaActualizacionFiltro = utils.construirFiltroFecha("fechaActualizacion", fechaActualizacion, "La", "fechaActualizacion");

    if (fechaRegistroFiltro) {
        filtros.push(fechaRegistroFiltro);
    }
    if (fechaActualizacionFiltro) {
        filtros.push(fechaActualizacionFiltro);
    }
    if (estado != null) {
        filtros.push({ estado });
    }
    if (sesion != null) {
        filtros.push({ sesion });
    }

    return filtros.length > 0 ? { $and: filtros } : {};
};

// Metodo para obtener usuarios paginados ordenados por fecha de registro descendente.
export const obtenerUsuariosPaginados = async (collection, filter = {}, { limit = 20 } = {}) => {
    return collection
        .find(filter)
        .sort({ fechaRegistro: -1, _id: -1 })
        .limit(limit)
        .toArray();
};