import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import { createAutorizacionTestContext } from "../../../../test-support/sistema/autorizacion.helpers.js";

const ctx = createAutorizacionTestContext();
const ENDPOINT_REGISTRAR_MODULO = "/sistema/sistemas/modulos/registrarModulo";
const MODULO_SISTEMAS_BASE = {
    nombre: "Sistemas Alpha",
    descripcion: "Modulo principal de sistemas",
    tipo: "sistemas",
    icono: "el-icon",
};
const MODULO_SISTEMAS_TIPO_BINARIO = {
    nombre: "Sistemas Core",
    descripcion: "Modulo gestionar modulos y procesos",
    tipo: 0,
    icono: "pc-icon",
};

const generarCodigoUnico = (prefijo) => `${prefijo}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const construirPayloadRegistroModulo = ({ actorId, ...override } = {}) => ({
    ...MODULO_SISTEMAS_BASE,
    codigo: generarCodigoUnico("sistemas"),
    usuarioRegistroId: actorId,
    ...override,
});

const ejecutarRegistroModulo = ({ token, payload }) => request(app)
    .post(ENDPOINT_REGISTRAR_MODULO)
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

const validarRegistroExitosoModulo = ({ response, codigoEsperado, iconoEsperado, tipoEsperado = "sistemas" }) => {
    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data?.modulo?.tipo, tipoEsperado);
    assert.equal(response.body.data?.modulo?.codigo, codigoEsperado);
    assert.equal(response.body.data?.modulo?.icono, iconoEsperado);
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

test("POST /sistema/sistemas/modulos/registrarModulo responde 201 con payload válido", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const payload = construirPayloadRegistroModulo({
        actorId,
        codigo: generarCodigoUnico("sistemas"),
    });

    const response = await ejecutarRegistroModulo({ token, payload });

    validarRegistroExitosoModulo({
        response,
        codigoEsperado: payload.codigo,
        iconoEsperado: payload.icono,
    });
    ctx.trackModuloId(response.body.data.modulo.id);
});

test("POST /sistema/sistemas/modulos/registrarModulo acepta tipo binario", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const payload = construirPayloadRegistroModulo({
        actorId,
        ...MODULO_SISTEMAS_TIPO_BINARIO,
        codigo: generarCodigoUnico("sis"),
    });

    const response = await ejecutarRegistroModulo({ token, payload });

    validarRegistroExitosoModulo({
        response,
        codigoEsperado: payload.codigo.toLowerCase(),
        iconoEsperado: payload.icono,
    });
    ctx.trackModuloId(response.body.data.modulo.id);
});