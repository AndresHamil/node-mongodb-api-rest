import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as perfilesMethods from "./methods/perfiles.methods.js";

export const registrarPerfil = async (req, res) => {
    try {
        const payload = perfilesMethods.prepararRegistroPerfil(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });

        const perfilesCollection = await perfilesMethods.getPerfilesCollection();
        await perfilesMethods.validarDuplicadoPerfil(perfilesCollection, {
            nombreNormalizado: payload.nombreNormalizado,
        });

        const nuevoPerfil = perfilesMethods.construirDocumentoNuevoPerfil({
            ...payload,
            usuarioRegistroObjectId,
        });

        const { insertedId } = await perfilesCollection.insertOne(nuevoPerfil);
        nuevoPerfil._id = insertedId;

        return res
            .status(201)
            .location(`/sistema/accesos/perfiles/registrarPerfil`)
            .json(methods.crearRespuestaApi({
                message: "Registro exitoso",
                data: perfilesMethods.construirPayloadPerfil(nuevoPerfil),
            }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "perfiles.registrarPerfil",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};