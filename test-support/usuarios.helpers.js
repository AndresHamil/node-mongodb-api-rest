import { ObjectId } from "mongodb";
import { connectMongo, closeMongo } from "../src/db.js";
import * as methods from "../src/utils/methods.js";
import * as usuariosMethods from "../src/controllers/sistema/accesos/usuarios/methods/usuarios.methods.js";

export const createUsuariosTestContext = () => {
    const trackedUserIds = new Set();
    const trackedSessionIds = new Set();

    const trackUserId = (id) => {
        trackedUserIds.add(id.toString());
    };

    const trackSessionId = (id) => {
        trackedSessionIds.add(id.toString());
    };

    const setupDatabase = async () => {
        await connectMongo();
    };

    const cleanupTestData = async () => {
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const sesionesCollection = await methods.getSesionesCollection();

        if (trackedSessionIds.size > 0) {
            await sesionesCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedSessionIds, (id) => new ObjectId(id)),
                },
            });
            trackedSessionIds.clear();
        }

        if (trackedUserIds.size > 0) {
            await sesionesCollection.deleteMany({
                fkUsuarioId: {
                    $in: Array.from(trackedUserIds, (id) => new ObjectId(id)),
                },
            });

            await usuariosCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedUserIds, (id) => new ObjectId(id)),
                },
            });
            trackedUserIds.clear();
        }
    };

    const teardownDatabase = async () => {
        await cleanupTestData();
        await closeMongo();
    };

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
        trackUserId(insertedId);

        const sesion = methods.crearDocumentoSesion({
            usuarioId: insertedId,
            metadata: {
                dispositivo: "Test Runner",
                userAgent: "node-test",
                ip: "127.0.0.1",
            },
        });

        const sesionResult = await sesionesCollection.insertOne(sesion);
        trackSessionId(sesionResult.insertedId);

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
        trackUserId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    return {
        setupDatabase,
        cleanupTestData,
        teardownDatabase,
        createActorSession,
        createUser,
        trackUserId,
        trackSessionId,
    };
};