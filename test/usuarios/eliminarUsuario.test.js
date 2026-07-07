import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { ObjectId } from "mongodb";
import { app } from "../../src/app.js";
import * as methods from "../../src/utils/methods.js";
import * as usuariosMethods from "../../src/controllers/gestion/usuarios/methods/usuarios.methods.js";
import { createUsuariosTestContext } from "../../test-support/usuarios.helpers.js";

const ctx = createUsuariosTestContext();

// Metodo para preparar la base de datos antes de ejecutar la suite de eliminacion de usuarios.
test.before(async () => {
    await ctx.setupDatabase();
});

// Metodo para cerrar la base de datos al finalizar la suite de eliminacion de usuarios.
test.after(async () => {
    await ctx.teardownDatabase();
});

// Metodo para limpiar los datos de prueba despues de cada caso de eliminacion.
test.afterEach(async () => {
    await ctx.cleanupTestData();
});

// Metodo para probar que eliminar usuarios exige un token de sesion valido.
test("DELETE /gestion/usuarios/eliminarUsuario responde 401 sin token", async () => {
    const usuario = await ctx.createUser();

    const response = await request(app)
        .delete("/gestion/usuario/usuarios/eliminarUsuario")
        .send({
            id: usuario.insertedId.toString(),
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

// Metodo para probar que eliminar un usuario tambien elimina sus sesiones asociadas.
test("DELETE /gestion/usuarios/eliminarUsuario responde 200 cuando elimina un usuario", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser();
    const sesionesCollection = await methods.getSesionesCollection();

    const sesionWeb = methods.crearDocumentoSesion({
        usuarioId: usuario.insertedId,
        metadata: {
            dispositivo: "Chrome",
            userAgent: "chrome-test",
            ip: "127.0.0.1",
        },
    });
    const sesionMovil = methods.crearDocumentoSesion({
        usuarioId: usuario.insertedId,
        metadata: {
            dispositivo: "Android",
            userAgent: "android-test",
            ip: "127.0.0.2",
        },
    });

    const resultadoSesionWeb = await sesionesCollection.insertOne(sesionWeb);
    const resultadoSesionMovil = await sesionesCollection.insertOne(sesionMovil);
    ctx.trackSessionId(resultadoSesionWeb.insertedId);
    ctx.trackSessionId(resultadoSesionMovil.insertedId);

    const response = await request(app)
        .delete("/gestion/usuario/usuarios/eliminarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
        });

    const usuariosCollection = await usuariosMethods.getUsuariosCollection();
    const usuarioEliminado = await usuariosCollection.findOne({ _id: usuario.insertedId });
    const sesionesRestantes = await sesionesCollection.countDocuments({ fkUsuarioId: usuario.insertedId });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(usuarioEliminado, null);
    assert.equal(sesionesRestantes, 0);
});

// Metodo para probar la respuesta cuando se intenta eliminar un usuario inexistente.
test("DELETE /gestion/usuarios/eliminarUsuario responde 404 si el usuario no existe", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .delete("/gestion/usuario/usuarios/eliminarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: new ObjectId().toString(),
        });

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
});