import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as sistemaMethods from "../../methods/sistema.methods.js";
import * as procesosMethods from "./methods/procesos.methods.js";
import * as usuariosMethods from "../../accesos/usuarios/methods/usuarios.methods.js";

const construirNombreCompletoUsuario = (usuario) => [usuario?.nombre, usuario?.apellido]
    .map((valor) => `${valor ?? ""}`.trim())
    .filter(Boolean)
    .join(" ") || null;

export const registrarProceso = async (req, res) => {
    try {
        const payload = procesosMethods.prepararRegistroProceso(req.body ?? {});
        const usuarioRegistroObjectId = await sistemaMethods.validarUsuarioCreadorSistema({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });

        const modulo = await procesosMethods.validarModuloProceso(payload.moduloId);
        const procesosCollection = await procesosMethods.getProcesosCollection();

        await procesosMethods.validarDuplicadoProceso(procesosCollection, {
            fkModuloId: modulo._id,
            codigo: payload.codigo,
            url: sistemaMethods.construirRutaJerarquicaProceso({
                tipo: modulo.tipo,
                moduloNombre: modulo.nombre,
                procesoNombre: payload.nombre,
            }).slice(1),
            nombreNormalizado: payload.nombreNormalizado,
        });

        const nuevoProceso = procesosMethods.construirDocumentoNuevoProceso({
            ...payload,
            fkModuloId: modulo._id,
            moduloNombre: modulo.nombre,
            moduloTipo: modulo.tipo,
            usuarioRegistroObjectId,
        });

        const { insertedId } = await procesosCollection.insertOne(nuevoProceso);
        nuevoProceso._id = insertedId;
        const usuarioRegistro = await usuariosMethods.buscarUsuarioPorId(usuarioRegistroObjectId);
        const { usuarioRegistroId: _usuarioRegistroId, ...respuestaProceso } = procesosMethods.construirRespuestaProceso(nuevoProceso, modulo);

        return res.status(201).location(`/sistema/sistemas/procesos/registrarProceso`).json(methods.crearRespuestaApi({
            message: "Registro exitoso",
            data: {
                proceso: {
                    ...respuestaProceso,
                    usuarioRegistro: construirNombreCompletoUsuario(usuarioRegistro),
                },
            },
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "procesos.registrarProceso",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};