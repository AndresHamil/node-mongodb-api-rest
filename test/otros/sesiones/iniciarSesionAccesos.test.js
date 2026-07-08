import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../../../src/app.js";
import { createAutorizacionTestContext } from "../../../test-support/sistema/autorizacion.helpers.js";

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

test("POST /sesiones/iniciarSesion devuelve contexto organizacional y accesos del perfil", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const empresa = await ctx.createEmpresa({
        nombre: "Empresa X",
        usuarioRegistroId: actorId,
    });
    const sucursal = await ctx.createSucursal({
        empresaId: empresa.insertedId.toString(),
        nombre: "Ciudad de Mexico",
        usuarioRegistroId: actorId,
    });
    const departamento = await ctx.createDepartamento({
        empresaId: empresa.insertedId.toString(),
        sucursalId: sucursal.insertedId.toString(),
        nombre: "Sistemas",
        usuarioRegistroId: actorId,
    });
    const perfil = await ctx.createPerfil({
        nombre: "Programador Web",
        permisos: [],
        usuarioRegistroId: actorId,
    });
    const usuario = await ctx.createAssignedUser({
        nombre: "Miguel",
        apellido: "Rosales",
        email: `miguel.${Date.now()}@test.local`,
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
        icono: "el-icon",
        usuarioRegistroId: actorId,
    });
    const proceso = await ctx.createProceso({
        moduloId: modulo.insertedId.toString(),
        moduloCodigo: "sistemas",
        nombre: "Inventario",
        descripcion: "Proceso para administrar inventario",
        codigo: "inventario",
        ruta: "/sistema/sistemas/inventario",
        icono: "inventory-icon",
        usuarioRegistroId: actorId,
    });
    const moduloAdministracion = await ctx.createModulo({
        nombre: "Administracion",
        codigo: "administracion",
        tipo: "gestion",
        icono: "management-icon",
        usuarioRegistroId: actorId,
    });
    const procesoAdministracion = await ctx.createProceso({
        moduloId: moduloAdministracion.insertedId.toString(),
        moduloCodigo: "administracion",
        moduloNombre: "Administracion",
        moduloTipo: "gestion",
        nombre: "Accesos",
        descripcion: "Proceso para administrar accesos",
        codigo: "accesos",
        icono: "access-icon",
        usuarioRegistroId: actorId,
    });

    const accesoResponse = await request(app)
        .post("/sistema/accesos/permisos/registrarPermiso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            procesoId: proceso.insertedId.toString(),
            sucursales: [sucursal.insertedId.toString()],
            departamentos: [departamento.insertedId.toString()],
            perfiles: [perfil.insertedId.toString()],
            usuarios: [{ id: usuario.insertedId.toString(), tipo: 0 }],
            usuarioRegistroId: actorId,
        });

    assert.equal(accesoResponse.status, 200);
    assert.equal(accesoResponse.body.data?.permiso?.proceso?.descripcion, "Proceso para administrar inventario");

    const accesoAdministracionResponse = await request(app)
        .post("/sistema/accesos/permisos/registrarPermiso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            procesoId: procesoAdministracion.insertedId.toString(),
            sucursales: [sucursal.insertedId.toString()],
            departamentos: [departamento.insertedId.toString()],
            perfiles: [perfil.insertedId.toString()],
            usuarios: [{ id: usuario.insertedId.toString(), tipo: 1 }],
            usuarioRegistroId: actorId,
        });

    assert.equal(accesoAdministracionResponse.status, 200);

    const loginResponse = await request(app)
        .post("/sesiones/iniciarSesion")
        .send({
            usuario: usuario.credenciales.usuario,
            password: usuario.credenciales.password,
            dispositivo: "Chrome",
        });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.success, true);

    const usuarioRespuesta = loginResponse.body.data?.[0]?.usuario;
    assert.equal(usuarioRespuesta?.asignaciones?.[0]?.empresa, "Empresa X");
    assert.equal(usuarioRespuesta?.asignaciones?.[0]?.sucursal, "Ciudad De Mexico");
    assert.equal(usuarioRespuesta?.asignaciones?.[0]?.departamento, "Sistemas");
    assert.equal(usuarioRespuesta?.asignaciones?.[0]?.perfil, "Programador Web");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.length, 1);
    assert.equal(usuarioRespuesta?.accesos?.gestion?.length, 1);
    assert.equal(usuarioRespuesta?.accesos?.otros?.length, 0);
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.modulo, "Sistemas");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.tipo, "sistemas");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.nombre, "Inventario");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.descripcion, "Proceso para administrar inventario");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.icono, "inventory-icon");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.url, "sistema/sistemas/inventario");
    assert.equal(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.tipoPermiso, 0);
    assert.deepEqual(usuarioRespuesta?.accesos?.sistemas?.[0]?.procesos?.[0]?.permisos, ["sistema.sistemas.inventario.read"]);
    assert.equal(usuarioRespuesta?.accesos?.gestion?.[0]?.modulo, "Administracion");
    assert.equal(usuarioRespuesta?.accesos?.gestion?.[0]?.procesos?.[0]?.nombre, "Accesos");
    assert.equal(usuarioRespuesta?.accesos?.gestion?.[0]?.procesos?.[0]?.descripcion, "Proceso para administrar accesos");
    assert.equal(usuarioRespuesta?.accesos?.gestion?.[0]?.procesos?.[0]?.url, "gestion/administracion/accesos");
    assert.equal(usuarioRespuesta?.accesos?.gestion?.[0]?.procesos?.[0]?.tipoPermiso, 1);
    assert.deepEqual(usuarioRespuesta?.accesos?.gestion?.[0]?.procesos?.[0]?.permisos, [
        "sistema.administracion.accesos.read",
        "sistema.administracion.accesos.write",
    ]);
});

test("POST /sesiones/iniciarSesion distingue permisos por usuario con el mismo perfil", async () => {
    const { token, actorId } = await ctx.createActorSession();
    const empresa = await ctx.createEmpresa({ nombre: "Empresa Y", usuarioRegistroId: actorId });
    const sucursal = await ctx.createSucursal({ empresaId: empresa.insertedId.toString(), nombre: "Sucursal Norte", usuarioRegistroId: actorId });
    const departamento = await ctx.createDepartamento({ empresaId: empresa.insertedId.toString(), sucursalId: sucursal.insertedId.toString(), nombre: "Almacen", usuarioRegistroId: actorId });
    const perfil = await ctx.createPerfil({ nombre: "Almacenista", usuarioRegistroId: actorId });
    const usuarioVeterano = await ctx.createAssignedUser({
        nombre: "Pedro",
        apellido: "Veterano",
        email: `pedro.${Date.now()}@test.local`,
        password: "Clave123?",
        empresaId: empresa.insertedId.toString(),
        sucursalId: sucursal.insertedId.toString(),
        departamentoId: departamento.insertedId.toString(),
        perfilId: perfil.insertedId.toString(),
        usuarioRegistroId: actorId,
    });
    const usuarioNovato = await ctx.createAssignedUser({
        nombre: "Juan",
        apellido: "Novato",
        email: `juan.${Date.now()}@test.local`,
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
        icono: "box-icon",
        usuarioRegistroId: actorId,
    });
    const proceso = await ctx.createProceso({
        moduloId: modulo.insertedId.toString(),
        moduloCodigo: "sistemas",
        nombre: "Inventarios",
        descripcion: "Proceso para revisar inventarios",
        codigo: "inventarios",
        icono: "inventory-icon",
        usuarioRegistroId: actorId,
    });

    const accesoResponse = await request(app)
        .post("/sistema/accesos/permisos/registrarPermiso")
        .set("Authorization", `Bearer ${token}`)
        .send({
            procesoId: proceso.insertedId.toString(),
            sucursales: [sucursal.insertedId.toString()],
            departamentos: [departamento.insertedId.toString()],
            perfiles: [perfil.insertedId.toString()],
            usuarios: [{ id: usuarioVeterano.insertedId.toString(), tipo: 1 }],
            usuarioRegistroId: actorId,
        });

    assert.equal(accesoResponse.status, 200);

    const loginVeterano = await request(app)
        .post("/sesiones/iniciarSesion")
        .send({
            usuario: usuarioVeterano.credenciales.usuario,
            password: usuarioVeterano.credenciales.password,
            dispositivo: "Chrome",
        });

    const loginNovato = await request(app)
        .post("/sesiones/iniciarSesion")
        .send({
            usuario: usuarioNovato.credenciales.usuario,
            password: usuarioNovato.credenciales.password,
            dispositivo: "Chrome",
        });

    assert.equal(loginVeterano.status, 200);
    assert.equal(loginVeterano.body.success, true);
    assert.equal(loginNovato.status, 200);
    assert.equal(loginNovato.body.success, true);

    const accesoVeterano = loginVeterano.body.data?.[0]?.usuario?.accesos?.sistemas?.[0]?.procesos?.[0];
    const accesoNovato = loginNovato.body.data?.[0]?.usuario?.accesos?.sistemas?.[0]?.procesos?.[0];

    assert.equal(accesoVeterano?.nombre, "Inventarios");
    assert.equal(accesoVeterano?.descripcion, "Proceso para revisar inventarios");
    assert.equal(accesoVeterano?.tipoPermiso, 1);
    assert.deepEqual(accesoVeterano?.permisos, [
        "sistema.sistemas.inventarios.read",
        "sistema.sistemas.inventarios.write",
    ]);
    assert.equal(accesoNovato?.nombre, "Inventarios");
    assert.equal(accesoNovato?.descripcion, "Proceso para revisar inventarios");
    assert.equal(accesoNovato?.tipoPermiso, 0);
    assert.deepEqual(accesoNovato?.permisos, ["sistema.sistemas.inventarios.read"]);
});

test("POST /sesiones/iniciarSesion permite enviar sistema operativo en el payload", async () => {
    const password = "Abc12345!";
    const nuevoUsuario = await ctx.createUser({ password });

    const loginResponse = await request(app)
        .post("/sesiones/iniciarSesion")
        .send({
            usuario: nuevoUsuario.documento.email,
            password,
            dispositivo: "PC",
            sistemaOperativo: "Windows 11",
        });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.success, true);
    assert.equal(loginResponse.body.data?.[0]?.sesion?.dispositivo, "PC");
    assert.equal(loginResponse.body.data?.[0]?.sesion?.sistemaOperativo, "Windows 11");
});