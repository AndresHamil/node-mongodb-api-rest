import * as methods from "../../../utils/methods.js";
import * as usuariosMethods from "../../sistema/accesos/usuarios/methods/usuarios.methods.js";


export const cerrarSesion = async (req, res) => {
    let { idSesion = null } = req.body ?? {};

    let successRes = true,
        messageRes = "Sesion cerrada correctamente",
        errorRes = null,
        dataRes = null;

    try {
        methods.validarTipoDato(idSesion, "El", "idSesion", "string");

        const sesion = await methods.validarCierreSesionSolicitada({
            sesionId: idSesion,
        });

        await methods.eliminarSesionActiva(sesion._id);

        const usuarioSigueActivo = await methods.usuarioTieneSesionesActivas(sesion.fkUsuarioId);
        await usuariosMethods.marcarSesionUsuario(sesion.fkUsuarioId, usuarioSigueActivo);

        dataRes = [{
            idSesion: sesion._id.toString(),
            sesionCerrada: true,
            usuarioConSesionActiva: usuarioSigueActivo,
        }];
    } catch (error) {
        successRes = false;
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;

        if (error.customMessage) {
            messageRes = error.customMessage;
        }
    }

    res.json({
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    });
};