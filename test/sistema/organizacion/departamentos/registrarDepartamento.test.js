import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import { createOrganizacionTestContext } from "../../../../test-support/sistema/organizacion/organizacion.helpers.js";

const ctx = createOrganizacionTestContext();
const ENDPOINT_REGISTRAR_EMPRESA = "/sistema/organizacion/empresas/registrarEmpresa";
const ENDPOINT_REGISTRAR_SUCURSAL = "/sistema/organizacion/sucursales/registrarSucursal";
const ENDPOINT_REGISTRAR_DEPARTAMENTO = "/sistema/organizacion/departamentos/registrarDepartamento";

const generarSufijo = () => Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

test.before(async () => {
    await ctx.setupDatabase();
});

test.after(async () => {
    await ctx.teardownDatabase();
});

test.afterEach(async () => {
    await ctx.cleanupTestData();
});

test("POST jerarquía organizacional registra empresa, sucursal y departamento", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = generarSufijo();

    const empresaResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_EMPRESA)
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Holding ${sufijo}`,
            descripcion: "Empresa principal",
            usuarioRegistroId: actorId,
        });

    assert.equal(empresaResponse.status, 201);
    assert.equal(empresaResponse.body.success, true);
    assert.equal(empresaResponse.body.data?.empresa?.usuarioRegistroId, actorId);
    ctx.trackEmpresaId(empresaResponse.body.data.empresa.id);

    const sucursalResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_SUCURSAL)
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresaId: empresaResponse.body.data.empresa.id,
            nombre: `Sucursal Centro ${sufijo}`,
            descripcion: "Operación central",
            usuarioRegistroId: actorId,
        });

    assert.equal(sucursalResponse.status, 201);
    assert.equal(sucursalResponse.body.success, true);
    assert.equal(sucursalResponse.body.data?.sucursal?.empresaId, empresaResponse.body.data.empresa.id);
    ctx.trackSucursalId(sucursalResponse.body.data.sucursal.id);

    const departamentoResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_DEPARTAMENTO)
        .set("Authorization", `Bearer ${token}`)
        .send({
            sucursalId: sucursalResponse.body.data.sucursal.id,
            nombre: `Recursos Humanos ${sufijo}`,
            descripcion: "Gestión del personal",
            usuarioRegistroId: actorId,
        });

    assert.equal(departamentoResponse.status, 201);
    assert.equal(departamentoResponse.body.success, true);
    assert.equal(departamentoResponse.body.data?.departamento?.empresaId, empresaResponse.body.data.empresa.id);
    assert.equal(departamentoResponse.body.data?.departamento?.sucursalId, sucursalResponse.body.data.sucursal.id);
    ctx.trackDepartamentoId(departamentoResponse.body.data.departamento.id);
});

test("POST /sistema/organizacion/departamentos/registrarDepartamento registra el mismo departamento en varias sucursales", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = generarSufijo();

    const empresaResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_EMPRESA)
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Holding Multi ${sufijo}`,
            descripcion: "Empresa principal",
            usuarioRegistroId: actorId,
        });

    assert.equal(empresaResponse.status, 201);
    ctx.trackEmpresaId(empresaResponse.body.data.empresa.id);

    const sucursalCentroResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_SUCURSAL)
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresaId: empresaResponse.body.data.empresa.id,
            nombre: `Sucursal Centro Multi ${sufijo}`,
            descripcion: "Operación central",
            usuarioRegistroId: actorId,
        });

    const sucursalNorteResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_SUCURSAL)
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresaId: empresaResponse.body.data.empresa.id,
            nombre: `Sucursal Norte Multi ${sufijo}`,
            descripcion: "Operación norte",
            usuarioRegistroId: actorId,
        });

    assert.equal(sucursalCentroResponse.status, 201);
    assert.equal(sucursalNorteResponse.status, 201);
    ctx.trackSucursalId(sucursalCentroResponse.body.data.sucursal.id);
    ctx.trackSucursalId(sucursalNorteResponse.body.data.sucursal.id);

    const departamentosResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_DEPARTAMENTO)
        .set("Authorization", `Bearer ${token}`)
        .send({
            sucursales: [
                sucursalCentroResponse.body.data.sucursal.id,
                sucursalNorteResponse.body.data.sucursal.id,
            ],
            nombre: `Administracion ${sufijo}`,
            descripcion: "Gestión del sistema",
            usuarioRegistroId: actorId,
        });

    assert.equal(departamentosResponse.status, 201);
    assert.equal(departamentosResponse.body.success, true);
    assert.equal(departamentosResponse.body.data?.departamentos?.length, 2);

    const sucursalesRegistradas = departamentosResponse.body.data.departamentos.map((item) => item.sucursalId).sort();
    const sucursalesEsperadas = [
        sucursalCentroResponse.body.data.sucursal.id,
        sucursalNorteResponse.body.data.sucursal.id,
    ].sort();

    assert.deepEqual(sucursalesRegistradas, sucursalesEsperadas);
    departamentosResponse.body.data.departamentos.forEach((item) => {
        assert.equal(item.empresaId, empresaResponse.body.data.empresa.id);
        ctx.trackDepartamentoId(item.id);
    });
});