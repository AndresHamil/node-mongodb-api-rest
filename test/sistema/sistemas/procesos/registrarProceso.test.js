import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import { createAutorizacionTestContext } from "../../../../test-support/sistema/autorizacion.helpers.js";

const ctx = createAutorizacionTestContext();
const ENDPOINT_REGISTRAR_PROCESO = "/sistema/sistemas/procesos/registrarProceso";
const MODULO_SISTEMAS_BASE = {
    nombre: "Sistemas Beta",
    tipo: "sistemas",
};
const MODULO_SISTEMAS_USUARIOS = {
    nombre: "Usuarios Gamma",
    tipo: "sistemas",
};
const PROCESO_SISTEMAS_BASE = {
    nombre: "Inventario Beta",
    descripcion: "Proceso de inventario del sistema",
    icono: "inventory-icon",
};
const PROCESO_ACCESOS_SISTEMA = {
    nombre: "Accesos",
    descripcion: "Proceso de accesos del sistema",
    icono: "access-icon",
};

const generarCodigoUnico = (prefijo) => `${prefijo}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const crearModuloDePrueba = ({ actorId, prefijoCodigo, ...override }) => ctx.createModulo({
    codigo: generarCodigoUnico(prefijoCodigo),
    usuarioRegistroId: actorId,
    ...override,
});

const construirPayloadRegistroProceso = ({ actorId, moduloId, prefijoCodigo, ...override }) => ({
    codigo: generarCodigoUnico(prefijoCodigo),
    moduloId,
    usuarioRegistroId: actorId,
    ...override,
});

const ejecutarRegistroProceso = ({ token, payload }) => request(app)
    .post(ENDPOINT_REGISTRAR_PROCESO)
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

const validarRegistroExitosoProceso = ({ response, urlEsperada, iconoEsperado }) => {
    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(Object.hasOwn(response.body.data?.proceso ?? {}, "ruta"), false);
    assert.equal(response.body.data?.proceso?.url, urlEsperada);
    assert.equal(response.body.data?.proceso?.icono, iconoEsperado);
    assert.equal(Object.hasOwn(response.body.data?.proceso ?? {}, "permisos"), false);
};

test.before(async () => {
    await ctx.setupDatabase();
});

test.after(async () => {
    await ctx.teardownDatabase();
});

test.afterEach(async () => {
    await ctx.cleanupTestData();
});

test("POST /sistema/sistemas/procesos/registrarProceso responde 201 y genera ruta sin permisos", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const modulo = await crearModuloDePrueba({
        actorId,
        prefijoCodigo: "sistemas",
        ...MODULO_SISTEMAS_BASE,
    });
    const payload = construirPayloadRegistroProceso({
        actorId,
        moduloId: modulo.insertedId.toString(),
        prefijoCodigo: "inventario",
        ...PROCESO_SISTEMAS_BASE,
    });

    const response = await ejecutarRegistroProceso({ token, payload });

    validarRegistroExitosoProceso({
        response,
        urlEsperada: "sistema/sistemas-beta/inventario-beta",
        iconoEsperado: payload.icono,
    });
    ctx.trackProcesoId(response.body.data.proceso.id);
});

test("POST /sistema/sistemas/procesos/registrarProceso calcula la ruta según el módulo del sistema", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const modulo = await crearModuloDePrueba({
        actorId,
        prefijoCodigo: "usuarios",
        ...MODULO_SISTEMAS_USUARIOS,
    });
    const payload = construirPayloadRegistroProceso({
        actorId,
        moduloId: modulo.insertedId.toString(),
        prefijoCodigo: "accesos",
        ...PROCESO_ACCESOS_SISTEMA,
    });

    const response = await ejecutarRegistroProceso({ token, payload });

    validarRegistroExitosoProceso({
        response,
        urlEsperada: "sistema/usuarios-gamma/accesos",
        iconoEsperado: payload.icono,
    });
    ctx.trackProcesoId(response.body.data.proceso.id);
});