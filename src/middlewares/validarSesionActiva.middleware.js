import * as methods from "../utils/methods.js";
import { registrarErrorEstructurado } from "../utils/logger.js";
import * as usuariosMethods from "../controllers/gestion/usuarios/methods/usuarios.methods.js";

export const validarSesionActiva = async (req, res, next) => {
    try {
        const token = methods.extraerTokenSesionRequest(req);

        if (!methods.normalizarString(token)) {
            throw methods.crearErrorAplicacion({
                message: "The token is required.",
                customMessage: "El token es requerido.",
                statusCode: 401,
                code: "UNAUTHORIZED",
            });
        }

        methods.validarCredencialesSesion({ token }, { requiereToken: true });

        const sesion = await methods.validarTokenSesionActiva(methods.normalizarString(token));
        const usuarioAutenticado = await usuariosMethods.buscarUsuarioPorId(sesion.fkUsuarioId);

        if (!usuarioAutenticado || usuarioAutenticado.estado === false) {
            throw methods.crearErrorAplicacion({
                message: "Authenticated user not available.",
                customMessage: "La sesion no pertenece a un usuario activo.",
                statusCode: 401,
                code: "SESSION_USER_INVALID",
            });
        }

        req.tokenSesion = token;
        req.sesionActiva = sesion;
        req.usuarioSesionId = sesion.fkUsuarioId?.toString?.() ?? null;
        req.usuarioAutenticado = usuarioAutenticado;

        next();
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "auth.validarSesionActiva",
            req,
        });

        res.status(error.statusCode ?? 401).json(methods.crearRespuestaErrorApi(error, {
            message: error.customMessage ?? "La sesion no es valida.",
        }));
    }
};