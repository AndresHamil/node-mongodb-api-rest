import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as sistemaMethods from "../../methods/sistema.methods.js";
import * as modulosMethods from "./methods/modulos.methods.js";
import * as usuariosMethods from "../../accesos/usuarios/methods/usuarios.methods.js";

const construirNombreCompletoUsuario = (usuario) => [usuario?.nombre, usuario?.apellido]
    .map((valor) => `${valor ?? ""}`.trim())
    .filter(Boolean)
    .join(" ") || null;

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

        const usuarioRegistro = await usuariosMethods.buscarUsuarioPorId(usuarioRegistroObjectId);
        const respuestaModulo = modulosMethods.construirRespuestaModulo(nuevoModulo);

        return res.status(201).location(`/sistema/sistemas/modulos/registrarModulo`).json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: {
                modulo: {
                    ...(({
                        usuarioRegistroId: _usuarioRegistroId,
                        ...modulo
                    }) => modulo)(respuestaModulo),
                    usuarioRegistro: construirNombreCompletoUsuario(usuarioRegistro),
                },
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