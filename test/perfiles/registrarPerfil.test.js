import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../src/app.js";
import { createAutorizacionTestContext } from "../../test-support/autorizacion.helpers.js";

const ctx = createAutorizacionTestContext();

test.before(async () => {
    await ctx.setupDatabase();
});

test.after(async () => {
    await ctx.teardownDatabase();
});

test.afterEach(async () => {
    await ctx.cleanupTestData();
});

test("POST /sistema/accesos/perfiles/registrarPerfil responde 401 sin token", async () => {
    const response = await request(app)
        .post("/sistema/accesos/perfiles/registrarPerfil")
        .send({
            nombre: "Administrador",
            descripcion: "Perfil administrativo",
            usuarioRegistroId: "507f1f77bcf86cd799439011",
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

test("POST /sistema/accesos/perfiles/registrarPerfil responde 201 con payload válido", async () => {
    const { token, actorId } = await ctx.createActorSession();

    const response = await request(app)
        .post("/sistema/accesos/perfiles/registrarPerfil")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Supervisor ERP",
            descripcion: "Gestiona accesos y permisos",
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.headers.location, "/sistema/accesos/perfiles/registrarPerfil");
    assert.equal(response.body.data?.perfil?.usuarioRegistroId, actorId);
    assert.deepEqual(response.body.data?.perfil?.permisos, []);

    ctx.trackPerfilId(response.body.data.perfil.id);
});