import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../src/app.js";
import * as usuariosMethods from "../../src/controllers/gestion/usuarios/methods/usuarios.methods.js";
import { createUsuariosTestContext } from "../../test-support/usuarios.helpers.js";

const ctx = createUsuariosTestContext();

// Metodo para preparar la base de datos antes de ejecutar la suite de registro de usuarios.
test.before(async () => {
    await ctx.setupDatabase();
});

// Metodo para cerrar la base de datos al finalizar la suite de registro de usuarios.
test.after(async () => {
    await ctx.teardownDatabase();
});

// Metodo para limpiar los datos de prueba despues de cada caso de registro.
test.afterEach(async () => {
    await ctx.cleanupTestData();
});

// Metodo para probar que registrar usuarios exige un token de sesion valido.
test("POST /gestion/usuarios/registrarUsuario responde 401 sin token", async () => {
    const response = await request(app)
        .post("/gestion/usuarios/registrarUsuario")
        .send({
            nombre: "Luis",
            apellido: "Perez",
            telefono: "1234567890",
            email: "luis.401@test.local",
            password: "Abc12345!",
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

// Metodo para probar el registro exitoso de un usuario con un payload valido.
test("POST /gestion/usuarios/registrarUsuario responde 201 con payload válido", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .post("/gestion/usuarios/registrarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Luis",
            apellido: "Perez",
            telefono: "1234567890",
            email: `luis.${Date.now()}@test.local`,
            password: "Abc12345!",
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data?.id, "string");
    assert.match(response.headers.location, /^\/gestion\/usuarios\/[a-f0-9]{24}$/i);

    ctx.trackUserId(response.body.data.id);
});

// Metodo para probar que el registro rechaza payloads con datos invalidos.
test("POST /gestion/usuarios/registrarUsuario responde 422 con payload inválido", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .post("/gestion/usuarios/registrarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Luis2",
            apellido: "Perez",
            telefono: "123",
            email: "correo-invalido",
            password: "123",
        });

    assert.equal(response.status, 422);
    assert.equal(response.body.success, false);
});

// Metodo para probar que el registro rechaza correos ya usados por otro usuario.
test("POST /gestion/usuarios/registrarUsuario responde 409 cuando el email ya existe", async () => {
    const { token } = await ctx.createActorSession();
    const usuariosCollection = await usuariosMethods.getUsuariosCollection();
    const email = `duplicado.${Date.now()}@test.local`;

    const existente = await usuariosMethods.construirDocumentoNuevoUsuario({
        nombre: "Usuario",
        apellido: "Existente",
        telefono: "1234567890",
        email,
        password: "Abc12345!",
    });

    const { insertedId } = await usuariosCollection.insertOne(existente);
    ctx.trackUserId(insertedId);

    const response = await request(app)
        .post("/gestion/usuarios/registrarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Luis",
            apellido: "Perez",
            telefono: "1234567890",
            email,
            password: "Abc12345!",
        });

    assert.equal(response.status, 409);
    assert.equal(response.body.success, false);
});