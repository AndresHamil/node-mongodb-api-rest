import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const consultarUsuariosFormulario = async (req, res) => {
    try {
        const filtro = usuariosMethods.construirFiltroFormularioUsuarios(req.body ?? {});
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const usuarios = await usuariosCollection
            .find(filtro)
            .sort({ nombre: 1, apellido: 1, _id: -1 })
            .limit(usuariosMethods.MAX_USUARIOS_RESULTS)
            .toArray();

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data: await usuariosMethods.construirRespuestaCatalogoUsuarios(usuarios),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.consultarUsuariosFormulario",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};