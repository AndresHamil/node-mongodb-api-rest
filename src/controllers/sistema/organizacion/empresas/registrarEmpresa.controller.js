import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as empresasMethods from "./methods/empresas.methods.js";

export const registrarEmpresa = async (req, res) => {
    try {
        const payload = empresasMethods.prepararRegistroEmpresa(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });

        const empresasCollection = await empresasMethods.getEmpresasCollection();
        await empresasMethods.validarDuplicadoEmpresa(empresasCollection, {
            nombreNormalizado: payload.nombreNormalizado,
        });

        const nuevaEmpresa = empresasMethods.construirDocumentoNuevaEmpresa({
            ...payload,
            usuarioRegistroObjectId,
        });

        const { insertedId } = await empresasCollection.insertOne(nuevaEmpresa);
        nuevaEmpresa._id = insertedId;

        return res
            .status(201)
            .location(`/sistema/organizacion/empresas/registrarEmpresa`)
            .json(methods.crearRespuestaApi({
                message: "Registro exitoso",
                data: {
                    empresa: empresasMethods.construirRespuestaEmpresa(nuevaEmpresa),
                },
            }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "empresas.registrarEmpresa",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};