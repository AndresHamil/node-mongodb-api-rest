import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const consultarUsuariosFiltros = async (req, res) => {
    try {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const filtros = usuariosMethods.construirFiltroUsuarios(req.body ?? {});
        const usuarios = await usuariosMethods.obtenerUsuariosPaginados(usuariosCollection, filtros);

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data: await usuariosMethods.construirRespuestaUsuarios(usuarios),
            totalCount: await usuariosCollection.countDocuments(),
            resultCount: await usuariosCollection.countDocuments(filtros),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.consultarUsuariosFiltros",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error, { totalCount: 0, resultCount: 0 }));
    }
};