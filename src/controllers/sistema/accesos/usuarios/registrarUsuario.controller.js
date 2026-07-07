import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";

export const registrarUsuario = async (req, res) => {
    try {
        const datosUsuario = usuariosMethods.prepararRegistroUsuario(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: datosUsuario.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });
        const asignacionValidada = await usuariosMethods.validarAsignacionRegistroUsuario(datosUsuario);
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const nuevoUsuario = await usuariosMethods.construirDocumentoNuevoUsuario({
            ...datosUsuario,
            asignaciones: [usuariosMethods.construirAsignacionUsuario({
                ...asignacionValidada,
                usuarioRegistroObjectId,
            })],
        });

        await usuariosMethods.validarDuplicadoUsuario(usuariosCollection, {
            email: nuevoUsuario.email,
            usuario: nuevoUsuario.usuario,
        });

        const { insertedId } = await usuariosCollection.insertOne(nuevoUsuario);

        nuevoUsuario._id = insertedId;

        return res
            .status(201)
            .location(`/sistema/accesos/usuarios/registrarUsuario`)
            .json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: await usuariosMethods.construirPayloadUsuario(nuevoUsuario),
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