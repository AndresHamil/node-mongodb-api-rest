import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.body ?? {};
        const objectId = methods.validarObjectId(id, "El", "id", true);
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const result = await usuariosCollection.deleteOne({ _id: objectId });

        if (!result.deletedCount) {
            return res.status(404).json(usuariosMethods.construirRespuestaUsuarioNoEncontrado(id));
        }

        await methods.eliminarSesionesUsuario(objectId);

        return res.status(200).json(methods.crearRespuestaApi({
            message: "El usuario se eliminó correctamente.",
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.eliminarUsuario",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};