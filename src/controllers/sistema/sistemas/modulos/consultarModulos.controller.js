import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as modulosMethods from "./methods/modulos.methods.js";
import * as procesosMethods from "../procesos/methods/procesos.methods.js";
import * as usuariosMethods from "../../accesos/usuarios/methods/usuarios.methods.js";

const construirNombreCompletoUsuario = (usuario) => [usuario?.nombre, usuario?.apellido]
    .map((valor) => `${valor ?? ""}`.trim())
    .filter(Boolean)
    .join(" ") || null;

export const consultarModulos = async (req, res) => {
    try {
        const modulosCollection = await modulosMethods.getModulosCollection();
        const procesosCollection = await procesosMethods.getProcesosCollection();
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const modulos = await modulosCollection
            .find({})
            .sort({ fechaRegistro: -1, _id: -1 })
            .toArray();

        const usuarioRegistroIds = [...new Set(modulos
            .map((modulo) => modulo.usuarioRegistroId)
            .filter(Boolean)
            .map((usuarioId) => usuarioId.toString()))];

        const usuariosRegistro = usuarioRegistroIds.length > 0
            ? await usuariosCollection.find({
                _id: { $in: usuarioRegistroIds.map((usuarioId) => methods.validarObjectId(usuarioId, "El", "usuarioRegistroId", true)) },
            }).toArray()
            : [];

        const usuariosRegistroMap = new Map(usuariosRegistro.map((usuario) => [
            usuario._id.toString(),
            construirNombreCompletoUsuario(usuario),
        ]));

        const modulosConResumen = await Promise.all(modulos.map(async (modulo) => {
            const numeroProcesos = await procesosCollection.countDocuments({
                fkModuloId: modulo._id,
                estado: { $ne: false },
            });

            const respuestaModulo = modulosMethods.construirRespuestaModulo(modulo);

            return {
                ...respuestaModulo,
                usuarioRegistro: usuariosRegistroMap.get(modulo.usuarioRegistroId?.toString?.() ?? "") ?? null,
                numeroProcesos,
            };
        }));

        const data = modulosConResumen.map(({ usuarioRegistroId: _usuarioRegistroId, ...modulo }) => modulo);

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data,
            totalCount: modulos.length,
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "modulos.consultarModulos",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error, { totalCount: 0 }));
    }
};