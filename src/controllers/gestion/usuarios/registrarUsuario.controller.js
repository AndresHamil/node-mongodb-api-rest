import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const registrarUsuario = async (req, res) => {
    try {
        const datosUsuario = usuariosMethods.prepararRegistroUsuario(req.body ?? {});
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const nuevoUsuario = await usuariosMethods.construirDocumentoNuevoUsuario(datosUsuario);

        await usuariosMethods.validarDuplicadoUsuario(usuariosCollection, {
            email: nuevoUsuario.email,
            usuario: nuevoUsuario.usuario,
        });

        const { insertedId } = await usuariosCollection.insertOne(nuevoUsuario);

        nuevoUsuario._id = insertedId;

        return res
            .status(201)
            .location(`/gestion/usuarios/${insertedId.toString()}`)
            .json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: await usuariosMethods.construirRespuestaUsuario(nuevoUsuario),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.registrarUsuario",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};