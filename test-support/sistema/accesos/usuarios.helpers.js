import * as methods from "../../../src/utils/methods.js";
import * as usuariosMethods from "../../../src/controllers/sistema/accesos/usuarios/methods/usuarios.methods.js";
import { createMongoTestContext, createTrackedIds } from "../../shared/mongo-test-context.helpers.js";

export const createUsuariosTestContext = () => {
    const trackedUserIds = createTrackedIds();
    const trackedSessionIds = createTrackedIds();

    const cleanupOwnData = async () => {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const sesionesCollection = await methods.getSesionesCollection();

        if (trackedSessionIds.hasIds()) {
            await sesionesCollection.deleteMany({
                _id: {
                    $in: trackedSessionIds.toObjectIds(),
                },
            });
            trackedSessionIds.clear();
        }

        if (trackedUserIds.hasIds()) {
            await sesionesCollection.deleteMany({
                fkUsuarioId: {
                    $in: trackedUserIds.toObjectIds(),
                },
            });

            await usuariosCollection.deleteMany({
                _id: {
                    $in: trackedUserIds.toObjectIds(),
                },
            });
            trackedUserIds.clear();
        }
    };

    const mongoContext = createMongoTestContext({ cleanupOwnData });

    const createActorSession = async () => {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const sesionesCollection = await methods.getSesionesCollection();
        const sufijo = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const password = await methods.generarHash("Actor123!");

        const actor = {
            nombre: "Actor",
            apellido: `Test ${sufijo}`,
            usuario: `actor.test.${sufijo}`,
            email: `actor.${sufijo}@test.local`,
            telefono: "1234567890",
            password,
            estado: true,
            sesion: true,
            fechaRegistro: new Date(),
            fechaActualizacion: new Date(),
        };

        const { insertedId } = await usuariosCollection.insertOne(actor);
        trackedUserIds.trackId(insertedId);

        const sesion = methods.crearDocumentoSesion({
            usuarioId: insertedId,
            metadata: {
                dispositivo: "Test Runner",
                userAgent: "node-test",
                ip: "127.0.0.1",
            },
        });

        const sesionResult = await sesionesCollection.insertOne(sesion);
        trackedSessionIds.trackId(sesionResult.insertedId);

        return {
            token: sesion.token,
            actorId: insertedId.toString(),
        };
    };

    const createUser = async ({
        nombre = "Luis",
        apellido = "Perez",
        telefono = "1234567890",
        email = `usuario.${Date.now()}${Math.floor(Math.random() * 10000)}@test.local`,
        password = "Abc12345!",
        estado = true,
        sesion = false,
    } = {}) => {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const documento = await usuariosMethods.construirDocumentoNuevoUsuario({
            nombre,
            apellido,
            telefono,
            email,
            password,
        });

        documento.estado = estado;
        documento.sesion = sesion;

        const { insertedId } = await usuariosCollection.insertOne(documento);
        trackedUserIds.trackId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    return {
        ...mongoContext,
        createActorSession,
        createUser,
        trackUserId: trackedUserIds.trackId,
        trackSessionId: trackedSessionIds.trackId,
    };
};