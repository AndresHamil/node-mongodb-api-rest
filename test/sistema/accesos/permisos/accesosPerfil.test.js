import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../../src/app.js";
import * as perfilesMethods from "../../../../src/controllers/sistema/accesos/perfiles/methods/perfiles.methods.js";
import { createAutorizacionTestContext } from "../../../../test-support/sistema/autorizacion.helpers.js";

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

test("POST /sistema/accesos/permisos/registrarPermiso asigna lectura base al perfil y override al usuario", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const empresa = await ctx.createEmpresa({ nombre: "Empresa Accesos", usuarioRegistroId: actorId });
    const sucursal = await ctx.createSucursal({ empresaId: empresa.insertedId.toString(), nombre: "Sucursal Accesos", usuarioRegistroId: actorId });
    const departamento = await ctx.createDepartamento({ empresaId: empresa.insertedId.toString(), sucursalId: sucursal.insertedId.toString(), nombre: "Departamento Accesos", usuarioRegistroId: actorId });
    const perfil = await ctx.createPerfil({
        nombre: "Programador Web",
        permisos: ["sistema.accesos.usuarios.consultar"],
        usuarioRegistroId: actorId,
    });
    const usuarioAsignado = await ctx.createAssignedUser({
        nombre: "Laura",
        apellido: "Campos",
        email: `laura.${Date.now()}@test.local`,
        password: "Clave123?",
        empresaId: empresa.insertedId.toString(),
        sucursalId: sucursal.insertedId.toString(),
        departamentoId: departamento.insertedId.toString(),
        perfilId: perfil.insertedId.toString(),
        usuarioRegistroId: actorId,
    });
    const modulo = await ctx.createModulo({
        nombre: "Sistemas",
        codigo: "sistemas",
        tipo: "sistemas",
        usuarioRegistroId: actorId,
    });
    const proceso = await ctx.createProceso({
        moduloId: modulo.insertedId.toString(),
        moduloNombre: "Sistemas",
        moduloTipo: "sistemas",
        moduloCodigo: "sistemas",
        nombre: "Inventario",
        codigo: "inventario",
        usuarioRegistroId: actorId,
    });

    const response = await request(app)
        .post("/sistema/accesos/permisos/registrarPermiso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            procesoId: proceso.insertedId.toString(),
            sucursales: [sucursal.insertedId.toString()],
            departamentos: [departamento.insertedId.toString()],
            perfiles: [perfil.insertedId.toString()],
            usuarios: [{ id: usuarioAsignado.insertedId.toString(), tipo: 1 }],
            usuarioRegistroId: actorId,
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data?.permiso?.proceso?.nombre, "Inventario");
    assert.equal(response.body.data?.permiso?.perfiles?.length, 1);
    assert.equal(response.body.data?.permiso?.usuarios?.[0]?.tipoPermiso, 1);

    const perfilDb = await perfilesMethods.buscarPerfilPorId(perfil.insertedId.toString());
    assert.equal(perfilDb.accesos?.length, 1);
    assert.deepEqual(perfilDb.accesos?.[0]?.permisos, ["sistema.sistemas.inventario.read"]);
    assert.equal(perfilDb.accesos?.[0]?.usuarios?.[0]?.tipoPermiso, 1);
    assert.ok(perfilDb.permisos.includes("sistema.accesos.usuarios.consultar"));
});