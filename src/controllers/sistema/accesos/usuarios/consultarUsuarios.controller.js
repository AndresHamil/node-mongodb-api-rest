import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const consultarUsuarios = async (req, res) => {
    try {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const usuarios = await usuariosMethods.obtenerUsuariosPaginados(usuariosCollection);

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data: await usuariosMethods.construirRespuestaUsuarios(usuarios),
            totalCount: await usuariosCollection.countDocuments(),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.consultarUsuarios",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error, { totalCount: 0 }));
    }
};