import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import { createOrganizacionTestContext } from "../../../../test-support/sistema/organizacion/organizacion.helpers.js";

const ctx = createOrganizacionTestContext();
const ENDPOINT_REGISTRAR_EMPRESA = "/sistema/organizacion/empresas/registrarEmpresa";
const ENDPOINT_REGISTRAR_SUCURSAL = "/sistema/organizacion/sucursales/registrarSucursal";

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

test("POST /sistema/organizacion/sucursales/registrarSucursal registra la misma sucursal en varias empresas", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const sufijo = generarSufijo();

    const empresaCentroResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_EMPRESA)
        .set("Authorization", `Bearer ${token}`)
        .send({
            nombre: `Valian Centro ${sufijo}`,
            descripcion: "Empresa centro",
            usuarioRegistroId: actorId,
        });

    const empresaNorteResponse = await request(app)
        .post(ENDPOINT_REGISTRAR_EMPRESA)
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
        .post(ENDPOINT_REGISTRAR_SUCURSAL)
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