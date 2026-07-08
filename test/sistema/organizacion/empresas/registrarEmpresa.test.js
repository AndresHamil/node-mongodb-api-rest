import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import { createOrganizacionTestContext } from "../../../../test-support/sistema/organizacion/organizacion.helpers.js";

const ctx = createOrganizacionTestContext();
const ENDPOINT_REGISTRAR_EMPRESA = "/sistema/organizacion/empresas/registrarEmpresa";
const ENDPOINT_CONSULTAR_EMPRESAS = "/sistema/organizacion/empresas/consultarEmpresas";
const EMPRESA_BASE = {
    nombre: "Valian Holding",
    descripcion: "Empresa principal",
};

const generarSufijo = () => Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

const construirPayloadEmpresa = ({ actorId, ...override } = {}) => ({
    ...EMPRESA_BASE,
    usuarioRegistroId: actorId,
    ...override,
});

const ejecutarRegistroEmpresa = ({ token, payload }) => request(app)
    .post(ENDPOINT_REGISTRAR_EMPRESA)
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

test.before(async () => {
    await ctx.setupDatabase();
});

test.after(async () => {
    await ctx.teardownDatabase();
});

test.afterEach(async () => {
    await ctx.cleanupTestData();
});

test("POST /sistema/organizacion/empresas/registrarEmpresa responde 401 sin token", async () => {
    const response = await request(app)
        .post(ENDPOINT_REGISTRAR_EMPRESA)
        .send({
            ...EMPRESA_BASE,
            usuarioRegistroId: "507f1f77bcf86cd799439011",
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

test("GET /sistema/organizacion/empresas/consultarEmpresas responde 200 con empresas", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = generarSufijo();
    const empresaAResponse = await ejecutarRegistroEmpresa({
        token,
        payload: construirPayloadEmpresa({
            actorId,
            nombre: `Empresa Alfa ${sufijo}`,
            descripcion: "Empresa de prueba A",
        }),
    });
    const empresaBResponse = await ejecutarRegistroEmpresa({
        token,
        payload: construirPayloadEmpresa({
            actorId,
            nombre: `Empresa Beta ${sufijo}`,
            descripcion: "Empresa de prueba B",
        }),
    });

    assert.equal(empresaAResponse.status, 201);
    assert.equal(empresaBResponse.status, 201);
    ctx.trackEmpresaId(empresaAResponse.body.data.empresa.id);
    ctx.trackEmpresaId(empresaBResponse.body.data.empresa.id);

    const sucursalEmpresaAResponse = await request(app)
        .post("/sistema/organizacion/sucursales/registrarSucursal")
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresaId: empresaAResponse.body.data.empresa.id,
            nombre: `Sucursal Consulta ${sufijo}`,
            descripcion: "Sucursal para conteo",
            usuarioRegistroId: actorId,
        });

    assert.equal(sucursalEmpresaAResponse.status, 201);
    ctx.trackSucursalId(sucursalEmpresaAResponse.body.data.sucursal.id);

    const response = await request(app)
        .get(ENDPOINT_CONSULTAR_EMPRESAS)
        .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(Array.isArray(response.body.data), true);
    assert.equal(response.body.data.some((item) => item.id === empresaAResponse.body.data.empresa.id), true);
    assert.equal(response.body.data.some((item) => item.id === empresaBResponse.body.data.empresa.id), true);
    assert.equal(response.body.totalCount >= 2, true);

    const empresaA = response.body.data.find((item) => item.id === empresaAResponse.body.data.empresa.id);
    const empresaB = response.body.data.find((item) => item.id === empresaBResponse.body.data.empresa.id);

    assert.equal(empresaA?.numeroSucursales, 1);
    assert.equal(empresaB?.numeroSucursales, 0);
});

test("POST /sistema/organizacion/empresas/registrarEmpresa responde 403 si usuarioRegistroId no coincide con la sesión", async () => {
    const { token } = await ctx.createActorSession();
    const otroUsuario = await ctx.createUser({
        nombre: "Otro",
        apellido: "Usuario",
        telefono: "1234567890",
        email: `otro.${Date.now()}@test.local`,
        password: "Abc12345!",
    });

    const response = await ejecutarRegistroEmpresa({
        token,
        payload: construirPayloadEmpresa({
            actorId: otroUsuario.insertedId.toString(),
            nombre: "Empresa Incorrecta",
            descripcion: "No debe registrarse",
        }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});