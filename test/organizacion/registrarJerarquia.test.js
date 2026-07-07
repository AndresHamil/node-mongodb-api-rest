import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../src/app.js";
import { createOrganizacionTestContext } from "../../test-support/organizacion.helpers.js";

const ctx = createOrganizacionTestContext();

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
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .send({
            nombre: "Valian Holding",
            descripcion: "Empresa principal",
            usuarioRegistroId: "507f1f77bcf86cd799439011",
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
});

test("GET /sistema/organizacion/empresas/consultarEmpresas responde 200 con empresas", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
    const empresaAResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Empresa Alfa ${sufijo}`,
            descripcion: "Empresa de prueba A",
            usuarioRegistroId: actorId,
        });
    const empresaBResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Empresa Beta ${sufijo}`,
            descripcion: "Empresa de prueba B",
            usuarioRegistroId: actorId,
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
        .get("/sistema/organizacion/empresas/consultarEmpresas")
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

test("POST jerarquía organizacional registra empresa, sucursal y departamento", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

    const empresaResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
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
        .post("/sistema/organizacion/sucursales/registrarSucursal")
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
        .post("/sistema/organizacion/departamentos/registrarDepartamento")
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
    const sufijo = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

    const empresaResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Holding Multi ${sufijo}`,
            descripcion: "Empresa principal",
            usuarioRegistroId: actorId,
        });

    assert.equal(empresaResponse.status, 201);
    ctx.trackEmpresaId(empresaResponse.body.data.empresa.id);

    const sucursalCentroResponse = await request(app)
        .post("/sistema/organizacion/sucursales/registrarSucursal")
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresaId: empresaResponse.body.data.empresa.id,
            nombre: `Sucursal Centro Multi ${sufijo}`,
            descripcion: "Operación central",
            usuarioRegistroId: actorId,
        });

    const sucursalNorteResponse = await request(app)
        .post("/sistema/organizacion/sucursales/registrarSucursal")
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
        .post("/sistema/organizacion/departamentos/registrarDepartamento")
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

test("POST /sistema/organizacion/sucursales/registrarSucursal registra la misma sucursal en varias empresas", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

    const empresaCentroResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Centro ${sufijo}`,
            descripcion: "Empresa centro",
            usuarioRegistroId: actorId,
        });

    const empresaNorteResponse = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Norte ${sufijo}`,
            descripcion: "Empresa norte",
            usuarioRegistroId: actorId,
        });

    assert.equal(empresaCentroResponse.status, 201);
    assert.equal(empresaNorteResponse.status, 201);
    ctx.trackEmpresaId(empresaCentroResponse.body.data.empresa.id);
    ctx.trackEmpresaId(empresaNorteResponse.body.data.empresa.id);

    const sucursalesResponse = await request(app)
        .post("/sistema/organizacion/sucursales/registrarSucursal")
        .set("Authorization", `Bearer ${token}`)
        .send({
            empresas: [
                empresaCentroResponse.body.data.empresa.id,
                empresaNorteResponse.body.data.empresa.id,
            ],
            nombre: `Sucursal Administrativa ${sufijo}`,
            descripcion: "Operación administrativa",
            usuarioRegistroId: actorId,
        });

    assert.equal(sucursalesResponse.status, 201);
    assert.equal(sucursalesResponse.body.success, true);
    assert.equal(sucursalesResponse.body.data?.sucursales?.length, 2);

    const empresasRegistradas = sucursalesResponse.body.data.sucursales.map((item) => item.empresaId).sort();
    const empresasEsperadas = [
        empresaCentroResponse.body.data.empresa.id,
        empresaNorteResponse.body.data.empresa.id,
    ].sort();
    const nombreEsperado = `Sucursal Administrativa ${sufijo.charAt(0)}${sufijo.slice(1).toLowerCase()}`;

    assert.deepEqual(empresasRegistradas, empresasEsperadas);
    sucursalesResponse.body.data.sucursales.forEach((item) => {
        assert.equal(item.nombre, nombreEsperado);
        ctx.trackSucursalId(item.id);
    });
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

    const response = await request(app)
        .post("/sistema/organizacion/empresas/registrarEmpresa")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: "Empresa Incorrecta",
            descripcion: "No debe registrarse",
            usuarioRegistroId: otroUsuario.insertedId.toString(),
        });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});