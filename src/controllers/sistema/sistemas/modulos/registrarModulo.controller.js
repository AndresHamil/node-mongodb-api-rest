import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as sistemaMethods from "../../methods/sistema.methods.js";
import * as modulosMethods from "./methods/modulos.methods.js";

export const registrarModulo = async (req, res) => {
    try {
        const payload = modulosMethods.prepararRegistroModulo(req.body ?? {});
        const usuarioRegistroObjectId = await sistemaMethods.validarUsuarioCreadorSistema({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });

        const modulosCollection = await modulosMethods.getModulosCollection();
        await modulosMethods.validarDuplicadoModulo(modulosCollection, {
            codigo: payload.codigo,
            nombreNormalizado: payload.nombreNormalizado,
        });

        const nuevoModulo = modulosMethods.construirDocumentoNuevoModulo({
            ...payload,
            usuarioRegistroObjectId,
        });

        const { insertedId } = await modulosCollection.insertOne(nuevoModulo);
        nuevoModulo._id = insertedId;

        return res.status(201).location(`/sistema/sistemas/modulos/registrarModulo`).json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: {
                modulo: modulosMethods.construirRespuestaModulo(nuevoModulo),
            },
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "modulos.registrarModulo",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};