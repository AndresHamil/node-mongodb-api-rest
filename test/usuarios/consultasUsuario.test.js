import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { ObjectId } from "mongodb";
import { app } from "../../src/app.js";
import { createUsuariosTestContext } from "../../test-support/usuarios.helpers.js";

const ctx = createUsuariosTestContext();

// Metodo para preparar la base de datos antes de ejecutar la suite de consultas de usuarios.
test.before(async () => {
    await ctx.setupDatabase();
});

// Metodo para cerrar la base de datos al finalizar la suite de consultas de usuarios.
test.after(async () => {
    await ctx.teardownDatabase();
});

// Metodo para limpiar los datos de prueba despues de cada caso de consulta.
test.afterEach(async () => {
    await ctx.cleanupTestData();
});

// Metodo para probar que listar usuarios exige un token de sesion valido.
test("GET /gestion/usuarios/consultarUsuarios responde 401 sin token", async () => {
    const response = await request(app)
        .get("/gestion/usuarios/consultarUsuarios");

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

// Metodo para probar que el listado de usuarios devuelve resultados autenticados correctamente.
test("GET /gestion/usuarios/consultarUsuarios responde 200 con usuarios", async () => {
    const { token } = await ctx.createActorSession();
    const usuarioA = await ctx.createUser({ nombre: "Listado", apellido: "Uno" });
    const usuarioB = await ctx.createUser({ nombre: "Listado", apellido: "Dos" });

    const response = await request(app)
        .get("/gestion/usuarios/consultarUsuarios")
        .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(Array.isArray(response.body.data), true);
    assert.equal(response.body.data.some((item) => item.id === usuarioA.insertedId.toString()), true);
    assert.equal(response.body.data.some((item) => item.id === usuarioB.insertedId.toString()), true);
    assert.equal(response.body.totalCount >= 2, true);
});

// Metodo para probar la consulta de un usuario existente por su identificador.
test("GET /gestion/usuarios/:id responde 200 con un usuario existente", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ nombre: "Consulta", apellido: "Detalle" });

    const response = await request(app)
        .get(`/gestion/usuarios/${usuario.insertedId.toString()}`)
        .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.id, usuario.insertedId.toString());
    assert.equal(response.body.data.nombre, "Consulta");
});

// Metodo para probar la respuesta cuando se consulta un usuario inexistente.
test("POST /gestion/usuarios/consultarUsuario responde 404 si el usuario no existe", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .post("/gestion/usuarios/consultarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            id: new ObjectId().toString(),
        });

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
});

// Metodo para probar la busqueda filtrada de usuarios con criterios validos.
test("POST /gestion/usuarios/consultarUsuariosFiltros responde 200 con coincidencias", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({
        nombre: "Filtro",
        apellido: `Objetivo${Date.now()}`,
        email: `filtro.${Date.now()}@test.local`,
    });

    const response = await request(app)
        .post("/gestion/usuarios/consultarUsuariosFiltros")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Filtro",
            email: usuario.documento.email,
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.resultCount >= 1, true);
    assert.equal(response.body.data.some((item) => item.id === usuario.insertedId.toString()), true);
});

// Metodo para probar que la busqueda filtrada rechaza valores con formato invalido.
test("POST /gestion/usuarios/consultarUsuariosFiltros responde 422 con filtro inválido", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .post("/gestion/usuarios/consultarUsuariosFiltros")
        .set("Authorization", `Bearer ${token}`)
        .send({
            estado: "activo",
        });

    assert.equal(response.status, 422);
    assert.equal(response.body.success, false);
});

// Metodo para probar la consulta de usuarios en formato catalogo para formularios.
test("POST /gestion/usuarios/consultarUsuariosFormulario responde 200 con catálogo de usuarios", async () => {
    const { token } = await ctx.createActorSession();
    const usuario = await ctx.createUser({ nombre: "Catalogo", apellido: "Visible" });

    const response = await request(app)
        .post("/gestion/usuarios/consultarUsuariosFormulario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Catalogo",
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(Array.isArray(response.body.data), true);
    assert.equal(response.body.data.some((item) => item.id === usuario.insertedId.toString()), true);
});

// Metodo para probar que el formulario tambien puede buscar usuarios por email.
test("POST /gestion/usuarios/consultarUsuariosFormulario responde 200 filtrando por email usando nombre", async () => {
    const { token } = await ctx.createActorSession();
    const email = `admin.${Date.now()}@valian.local`;
    const usuario = await ctx.createUser({
        nombre: "Admin",
        apellido: "Valian",
        email,
    });

    const response = await request(app)
        .post("/gestion/usuarios/consultarUsuariosFormulario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: email,
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(Array.isArray(response.body.data), true);
    assert.equal(response.body.data.some((item) => item.id === usuario.insertedId.toString()), true);
});