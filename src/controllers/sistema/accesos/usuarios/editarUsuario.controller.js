import * as methods from "../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../utils/logger.js";
import * as usuariosMethods from "./methods/usuarios.methods.js";


export const editarUsuario = async (req, res) => {
    try {
        const { id = null } = req.body ?? {};
        const objectId = methods.validarObjectId(id, "El", "id", true);
        const {
            nombre,
            apellido,
            email,
            telefono,
            currentPassword,
            newPassword,
            estado,
            sesion,
        } = usuariosMethods.prepararEdicionUsuario(req.body ?? {});

        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const usuarioActual = await usuariosCollection.findOne({ _id: objectId });

        if (!usuarioActual) {
            return res.status(404).json(methods.crearRespuestaApi({
                success: false,
                message: `No se encontro el usuario con id '${id}'.`,
                error: `No record found for id '${id}' in collection 'usuarios'.`,
                data: null,
            }));
        }

        const passwordCambioValidado = await usuariosMethods.validarCambioPassword({
            currentPassword,
            newPassword,
            usuarioActual,
        });

        const actualizaciones = await usuariosMethods.construirActualizacionesUsuario({
            nombre,
            apellido,
            email,
            telefono,
            newPassword: passwordCambioValidado,
            estado,
            sesion,
        }, usuarioActual);

        await usuariosMethods.validarDuplicadoUsuario(usuariosCollection, {
            email: actualizaciones.email,
            usuario: actualizaciones.usuario,
            excludeId: objectId,
        });

        await usuariosCollection.updateOne(
            { _id: objectId },
            { $set: actualizaciones }
        );

        if (sesion === false) {
            await methods.eliminarSesionesUsuario(objectId);
        }

        const usuarioActualizado = await usuariosCollection.findOne({ _id: objectId });

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Edición exitosa",
            data: await usuariosMethods.construirRespuestaUsuario(usuarioActualizado),
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "usuarios.editarUsuario",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};