import * as methods from "../../../utils/methods.js";
import * as usuariosMethods from "../../sistema/accesos/usuarios/methods/usuarios.methods.js";

export const iniciarSesion = async (req, res) => {
    let {
        usuario = null,
        password = null,
        dispositivo = null,
        sistemaOperativo = null,
        tipoSistemaOperativo = null,
    } = req.body ?? {};

    let successRes = true,
        messageRes = "Inicio de sesion exitoso",
        errorRes = null,
        dataRes = null;

    try {
        methods.validarCredencialesSesion({
            usuario,
            password,
            dispositivo,
            sistemaOperativo: sistemaOperativo ?? tipoSistemaOperativo,
        });

        usuario = methods.normalizarUsuarioSesion(usuario);
        password = methods.normalizarString(password);
        const metadataSesion = methods.construirMetadataSesion(req, {
            dispositivo,
            sistemaOperativo: sistemaOperativo ?? tipoSistemaOperativo,
        });
        dispositivo = metadataSesion.dispositivo;

        const usuarioDb = await usuariosMethods.buscarUsuarioPorCredencial(usuario);

        if (!usuarioDb) {
            const error = new Error("Invalid credentials.");
            error.customMessage = "Las credenciales proporcionadas no son validas.";
            throw error;
        }

        const passwordValido = await methods.compararHash(password, usuarioDb.password);

        if (!passwordValido) {
            const error = new Error("Invalid credentials.");
            error.customMessage = "Las credenciales proporcionadas no son validas.";
            throw error;
        }

        await methods.depurarSesionesExpiradasUsuario(usuarioDb._id);
        const sesionesActivas = await methods.validarLimiteSesionesUsuario(usuarioDb._id);

        const sesionesCollection = await methods.getSesionesCollection();
        const nuevaSesion = methods.crearDocumentoSesion({
            usuarioId: usuarioDb._id,
            metadata: metadataSesion,
        });

        const { insertedId } = await sesionesCollection.insertOne(nuevaSesion);
        nuevaSesion._id = insertedId;

        await usuariosMethods.marcarSesionUsuario(usuarioDb._id, true);

        const usuarioActualizado = {
            ...usuarioDb,
            sesion: true,
            fechaActualizacion: new Date(),
        };

        dataRes = [{
            usuario: await usuariosMethods.construirRespuestaUsuario(usuarioActualizado, {
                includeContextoAsignaciones: true,
                includeAccesos: true,
            }),
            sesion: await methods.construirRespuestaSesion(nuevaSesion, { includeToken: true }),
            sesionesActivas: sesionesActivas.length + 1,
        }];
    } catch (error) {
        successRes = false;
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;

        if (error.customMessage) {
            messageRes = error.customMessage;
        }
        if (error.activeSessions) {
            dataRes = await Promise.all(error.activeSessions.map((sesion) => methods.construirRespuestaSesion(sesion)));
        }
    }

    res.json({
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    });
};
