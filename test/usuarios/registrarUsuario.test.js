import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import request from "supertest";
import { app } from "../../src/app.js";
import * as usuariosMethods from "../../src/controllers/sistema/accesos/usuarios/methods/usuarios.methods.js";
import { createAutorizacionTestContext } from "../../test-support/autorizacion.helpers.js";

const ctx = createAutorizacionTestContext();

const createRegistroDependencias = async (actorId) => {
    const empresa = await ctx.createEmpresa({
        nombre: "Empresa Usuario Prueba",
        usuarioRegistroId: actorId,
    });
    const sucursal = await ctx.createSucursal({
        empresaId: empresa.insertedId.toString(),
        nombre: "Sucursal Usuario Prueba",
        usuarioRegistroId: actorId,
    });
    const departamento = await ctx.createDepartamento({
        empresaId: empresa.insertedId.toString(),
        sucursalId: sucursal.insertedId.toString(),
        nombre: "Departamento Usuario Prueba",
        usuarioRegistroId: actorId,
    });
    const perfil = await ctx.createPerfil({
        nombre: "Perfil Usuario Prueba",
        permisos: [
            "gestion.usuarios.registrar",
            "gestion.usuarios.consultar",
        ],
        usuarioRegistroId: actorId,
    });

    return {
        empresaId: empresa.insertedId.toString(),
        sucursalId: sucursal.insertedId.toString(),
        departamentoId: departamento.insertedId.toString(),
        perfilId: perfil.insertedId.toString(),
    };
};

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
test("POST /sistema/accesos/usuarios/registrarUsuario responde 401 sin token", async () => {
    const response = await request(app)
        .post("/sistema/accesos/usuarios/registrarUsuario")
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
test("POST /sistema/accesos/usuarios/registrarUsuario responde 201 con payload válido", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const dependencias = await createRegistroDependencias(actorId);

    const response = await request(app)
        .post("/sistema/accesos/usuarios/registrarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Luis",
            apellido: "Perez",
            fechaNacimiento: "1995-08-21",
            telefono: "1234567890",
            email: `luis.${Date.now()}@test.local`,
            password: "Abc12345!",
            ...dependencias,
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data?.usuario?.id, "string");
    assert.equal(response.headers.location, "/sistema/accesos/usuarios/registrarUsuario");
    assert.equal(response.body.data?.usuario?.fechaNacimiento, "1995-08-21");
    assert.equal(response.body.data?.usuario?.asignaciones?.length, 1);
    assert.equal(response.body.data?.usuario?.asignaciones?.[0]?.empresaId, dependencias.empresaId);
    assert.equal(response.body.data?.usuario?.asignaciones?.[0]?.perfilId, dependencias.perfilId);

    ctx.trackUserId(response.body.data.usuario.id);
});

// Metodo para probar que el registro rechaza payloads con datos invalidos.
test("POST /sistema/accesos/usuarios/registrarUsuario responde 422 con payload inválido", async () => {
    const { token } = await ctx.createActorSession();

    const response = await request(app)
        .post("/sistema/accesos/usuarios/registrarUsuario")
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
test("POST /sistema/accesos/usuarios/registrarUsuario responde 409 cuando el email ya existe", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const dependencias = await createRegistroDependencias(actorId);
    const usuariosCollection = await usuariosMethods.getUsuariosCollection();
    const email = `duplicado.${Date.now()}@test.local`;

    const existente = await usuariosMethods.construirDocumentoNuevoUsuario({
        nombre: "Usuario",
        apellido: "Existente",
        telefono: "1234567890",
        email,
        password: "Abc12345!",
        asignaciones: [usuariosMethods.construirAsignacionUsuario({
            fkEmpresaId: ObjectId.createFromHexString(dependencias.empresaId),
            fkSucursalId: ObjectId.createFromHexString(dependencias.sucursalId),
            fkDepartamentoId: ObjectId.createFromHexString(dependencias.departamentoId),
            fkPerfilId: ObjectId.createFromHexString(dependencias.perfilId),
            usuarioRegistroObjectId: ObjectId.createFromHexString(actorId),
        })],
    });

    const { insertedId } = await usuariosCollection.insertOne(existente);
    ctx.trackUserId(insertedId);

    const response = await request(app)
        .post("/sistema/accesos/usuarios/registrarUsuario")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Luis",
            apellido: "Perez",
            telefono: "1234567890",
            email,
            password: "Abc12345!",
            ...dependencias,
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 409);
    assert.equal(response.body.success, false);
});