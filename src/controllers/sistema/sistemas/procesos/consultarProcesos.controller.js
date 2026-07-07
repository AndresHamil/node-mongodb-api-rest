import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as procesosMethods from "./methods/procesos.methods.js";
import * as modulosMethods from "../modulos/methods/modulos.methods.js";
import * as usuariosMethods from "../../accesos/usuarios/methods/usuarios.methods.js";

const construirNombreCompletoUsuario = (usuario) => [usuario?.nombre, usuario?.apellido]
    .map((valor) => `${valor ?? ""}`.trim())
    .filter(Boolean)
    .join(" ") || null;

export const consultarProcesos = async (req, res) => {
    try {
        const procesosCollection = await procesosMethods.getProcesosCollection();
        const modulosCollection = await modulosMethods.getModulosCollection();
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const procesos = await procesosCollection
            .find({})
            .sort({ fechaRegistro: -1, _id: -1 })
            .toArray();

        const moduloIds = [...new Set(procesos
            .map((proceso) => proceso.fkModuloId)
            .filter(Boolean)
            .map((moduloId) => moduloId.toString()))];
        const usuarioRegistroIds = [...new Set(procesos
            .map((proceso) => proceso.usuarioRegistroId)
            .filter(Boolean)
            .map((usuarioId) => usuarioId.toString()))];

        const [modulos, usuariosRegistro] = await Promise.all([
            moduloIds.length > 0
                ? modulosCollection.find({
                    _id: { $in: moduloIds.map((moduloId) => methods.validarObjectId(moduloId, "El", "moduloId", true)) },
                }).toArray()
                : [],
            usuarioRegistroIds.length > 0
                ? usuariosCollection.find({
                    _id: { $in: usuarioRegistroIds.map((usuarioId) => methods.validarObjectId(usuarioId, "El", "usuarioRegistroId", true)) },
                }).toArray()
                : [],
        ]);

        const modulosMap = new Map(modulos.map((modulo) => [modulo._id.toString(), modulo]));
        const usuariosRegistroMap = new Map(usuariosRegistro.map((usuario) => [
            usuario._id.toString(),
            construirNombreCompletoUsuario(usuario),
        ]));

        const data = procesos.map((proceso) => {
            const modulo = modulosMap.get(proceso.fkModuloId?.toString?.() ?? "") ?? null;
            const { usuarioRegistroId: _usuarioRegistroId, ...respuestaProceso } = procesosMethods.construirRespuestaProceso(proceso, modulo);

            return {
                ...respuestaProceso,
                usuarioRegistro: usuariosRegistroMap.get(proceso.usuarioRegistroId?.toString?.() ?? "") ?? null,
            };
        });

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data,
            totalCount: procesos.length,
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "procesos.consultarProcesos",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error, { totalCount: 0 }));
    }
};