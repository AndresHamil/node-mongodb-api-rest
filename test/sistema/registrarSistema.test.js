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

test("POST /sistema/sistemas/modulos/registrarModulo responde 201 con payload válido", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = "Alpha";
    const codigoUnico = `sistemas${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const response = await request(app)
        .post("/sistema/sistemas/modulos/registrarModulo")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Sistemas ${sufijo}`,
            descripcion: "Modulo principal de sistemas",
            tipo: "gestion",
            codigo: codigoUnico,
            icono: "el-icon",
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data?.modulo?.codigo, codigoUnico);
    assert.equal(response.body.data?.modulo?.icono, "el-icon");
    ctx.trackModuloId(response.body.data.modulo.id);
});

test("POST /sistema/sistemas/modulos/registrarModulo acepta tipo binario", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const codigoUnico = `sis${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const response = await request(app)
        .post("/sistema/sistemas/modulos/registrarModulo")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Sistemas Core",
            descripcion: "Modulo gestionar modulos y procesos",
            tipo: 0,
            codigo: codigoUnico,
            icono: "pc-icon",
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data?.modulo?.tipo, "sistemas");
    assert.equal(response.body.data?.modulo?.codigo, codigoUnico.toLowerCase());
    ctx.trackModuloId(response.body.data.modulo.id);
});

test("POST /sistema/sistemas/procesos/registrarProceso responde 201 y genera ruta sin permisos", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = "Beta";
    const moduloCodigoUnico = `sistemas${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const procesoCodigoUnico = `inventario${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const moduloNombre = `Procesos ${sufijo}`;
    const procesoNombre = `Procesos ${sufijo}`;
    const urlEsperada = "sistema/procesos-beta/procesos-beta";
    const modulo = await ctx.createModulo({
        nombre: moduloNombre,
        codigo: moduloCodigoUnico,
        tipo: "sistemas",
        usuarioRegistroId: actorId,
    });

    const response = await request(app)
        .post("/sistema/sistemas/procesos/registrarProceso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            moduloId: modulo.insertedId.toString(),
            nombre: procesoNombre,
            descripcion: "Proceso de inventario",
            codigo: procesoCodigoUnico,
            icono: "inventory-icon",
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(Object.hasOwn(response.body.data?.proceso ?? {}, "ruta"), false);
    assert.equal(response.body.data?.proceso?.url, urlEsperada);
    assert.equal(response.body.data?.proceso?.icono, "inventory-icon");
    assert.equal(Object.hasOwn(response.body.data?.proceso ?? {}, "permisos"), false);
    ctx.trackProcesoId(response.body.data.proceso.id);
});

test("POST /sistema/sistemas/procesos/registrarProceso calcula la ruta según el tipo del módulo", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const modulo = await ctx.createModulo({
        nombre: "Gestion Gamma",
        codigo: `gestion${Date.now()}${Math.floor(Math.random() * 1000)}`,
        tipo: "gestion",
        usuarioRegistroId: actorId,
    });

    const response = await request(app)
        .post("/sistema/sistemas/procesos/registrarProceso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            moduloId: modulo.insertedId.toString(),
            nombre: "Accesos",
            descripcion: "Proceso de gestion",
            codigo: `accesos${Date.now()}${Math.floor(Math.random() * 1000)}`,
            icono: "access-icon",
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data?.proceso?.url, "gestion/gestion-gamma/accesos");
    assert.equal(Object.hasOwn(response.body.data?.proceso ?? {}, "ruta"), false);
    ctx.trackProcesoId(response.body.data.proceso.id);
});