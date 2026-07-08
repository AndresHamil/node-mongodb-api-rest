import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { ObjectId } from "mongodb";
import { app } from "../../../../src/app.js";
import * as methods from "../../../../src/utils/methods.js";
import * as usuariosMethods from "../../../../src/controllers/sistema/accesos/usuarios/methods/usuarios.methods.js";
import { createUsuariosTestContext } from "../../../../test-support/sistema/accesos/usuarios.helpers.js";

const ctx = createUsuariosTestContext();

// Metodo para preparar la base de datos antes de ejecutar la suite de edicion de usuarios.
test.before(async () => {
    await ctx.setupDatabase();
});

// Metodo para cerrar la base de datos al finalizar la suite de edicion de usuarios.
test.after(async () => {
    await ctx.teardownDatabase();
});

// Metodo para limpiar los datos de prueba despues de cada caso de edicion.
test.afterEach(async () => {
    await ctx.cleanupTestData();
});

// Metodo para probar que editar usuarios exige un token de sesion valido.
test("PUT /sistema/accesos/usuarios/editarUsuario responde 401 sin token", async () => {
    const usuario = await ctx.createUser();

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .send({
            id: usuario.insertedId.toString(),
            nombre: "Mario",
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

// Metodo para probar una edicion valida de datos basicos del usuario.
test("PUT /sistema/accesos/usuarios/editarUsuario responde 200 con edición válida", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser();

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            nombre: "Mario",
            apellido: "Lopez",
            telefono: "0987654321",
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.nombre, "Mario");
    assert.equal(response.body.data.apellido, "Lopez");
    assert.equal(response.body.data.telefono, "0987654321");
});

// Metodo para probar que se puede editar solo el email enviando null en el resto de campos.
test("PUT /sistema/accesos/usuarios/editarUsuario permite editar solo email enviando null en el resto", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ email: `antes.${Date.now()}@test.local` });
    const nuevoEmail = `despues.${Date.now()}@test.local`;

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            nombre: null,
            apellido: null,
            email: nuevoEmail,
            telefono: null,
            currentPassword: null,
            newPassword: null,
            estado: null,
            sesion: null,
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.email, nuevoEmail);
});

// Metodo para probar que un telefono vacio elimina el valor almacenado.
test("PUT /sistema/accesos/usuarios/editarUsuario permite eliminar el telefono enviando string vacio", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ telefono: "1234567890" });

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            telefono: "",
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.telefono, null);
});

// Metodo para probar el cambio de contraseña usando la contraseña actual y una nueva contraseña.
test("PUT /sistema/accesos/usuarios/editarUsuario permite cambiar la contraseña con currentPassword y newPassword", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ password: "Temporal123!" });

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            currentPassword: "Temporal123!",
            newPassword: "NuevaClave123!",
        });

    const usuariosCollection = await usuariosMethods.getUsuariosCollection();
    const usuarioActualizado = await usuariosCollection.findOne({ _id: usuario.insertedId });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(await methods.compararHash("NuevaClave123!", usuarioActualizado.password), true);
});

// Metodo para probar que desactivar la sesion elimina todas las sesiones activas del usuario.
test("PUT /sistema/accesos/usuarios/editarUsuario elimina todas las sesiones del usuario cuando sesion=false", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ sesion: true });
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
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            sesion: false,
        });

    const sesionesRestantes = await sesionesCollection.countDocuments({
        fkUsuarioId: usuario.insertedId,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.sesion, false);
    assert.equal(sesionesRestantes, 0);
});

// Metodo para probar que no se permite activar sesiones desde el endpoint de edicion.
test("PUT /sistema/accesos/usuarios/editarUsuario rechaza sesion=true porque el inicio de sesión solo ocurre desde login", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ sesion: false });

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            sesion: true,
        });

    assert.equal(response.status, 422);
    assert.equal(response.body.success, false);
});

// Metodo para probar que el cambio de contraseña falla si la contraseña actual es incorrecta.
test("PUT /sistema/accesos/usuarios/editarUsuario rechaza el cambio si currentPassword es incorrecta", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ password: "Temporal123!" });

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            currentPassword: "Incorrecta123!",
            newPassword: "NuevaClave123!",
        });

    assert.equal(response.status, 422);
    assert.equal(response.body.success, false);
});

// Metodo para probar que la edicion rechaza payloads con datos invalidos.
test("PUT /sistema/accesos/usuarios/editarUsuario responde 422 con payload inválido", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser();

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuario.insertedId.toString(),
            nombre: "Mario2",
        });

    assert.equal(response.status, 422);
    assert.equal(response.body.success, false);
});

// Metodo para probar la respuesta cuando se intenta editar un usuario inexistente.
test("PUT /sistema/accesos/usuarios/editarUsuario responde 404 si el usuario no existe", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: new ObjectId().toString(),
            nombre: "Mario",
        });

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
});

// Metodo para probar que no se permite duplicar el email de otro usuario al editar.
test("PUT /sistema/accesos/usuarios/editarUsuario responde 409 cuando el email ya existe", async () => {
    const { token } = await ctx.createActorSession();
    const usuarioOrigen = await ctx.createUser({ email: `origen.${Date.now()}@test.local` });
    const emailDuplicado = `duplicado.${Date.now()}@test.local`;
    await ctx.createUser({ email: emailDuplicado });

    const response = await request(app)
        .put("/sistema/accesos/usuarios/editarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: usuarioOrigen.insertedId.toString(),
            email: emailDuplicado,
        });

    assert.equal(response.status, 409);
    assert.equal(response.body.success, false);
});