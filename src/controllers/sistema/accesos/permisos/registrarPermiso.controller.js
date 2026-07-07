import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as permisosMethods from "./methods/permisos.methods.js";

export const registrarPermiso = async (req, res) => {
    try {
        const payload = permisosMethods.prepararAsignacionPermiso(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });

        const contexto = await permisosMethods.resolverContextoAsignacion(payload, usuarioRegistroObjectId);
        const resultado = await permisosMethods.registrarPermisoPerfiles(contexto);

        return res.status(200).location("/sistema/accesos/permisos/registrarPermiso").json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: permisosMethods.construirPayloadPermiso(resultado),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "permisos.registrarPermiso",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};