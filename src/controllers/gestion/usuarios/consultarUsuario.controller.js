import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const consultarUsuario = async (req, res) => {
    try {
        const { id = null } = req.body ?? {};
        const paramId = req.params?.id ?? null;
        const usuarioId = paramId ?? id;
        const objectId = methods.validarObjectId(usuarioId, "El", "id", true);
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const usuario = await usuariosCollection.findOne({ _id: objectId });

        if (!usuario) {
            return res.status(404).json(usuariosMethods.construirRespuestaUsuarioNoEncontrado(usuarioId));
        }

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data: await usuariosMethods.construirRespuestaUsuario(usuario),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.consultarUsuario",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};