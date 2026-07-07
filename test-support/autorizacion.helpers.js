import { ObjectId } from "mongodb";
import { createOrganizacionTestContext } from "./organizacion.helpers.js";
import * as empresasMethods from "../src/controllers/sistema/organizacion/empresas/methods/empresas.methods.js";
import * as sucursalesMethods from "../src/controllers/sistema/organizacion/sucursales/methods/sucursales.methods.js";
import * as departamentosMethods from "../src/controllers/sistema/organizacion/departamentos/methods/departamentos.methods.js";
import * as perfilesMethods from "../src/controllers/sistema/accesos/perfiles/methods/perfiles.methods.js";
import * as usuariosMethods from "../src/controllers/sistema/accesos/usuarios/methods/usuarios.methods.js";
import * as modulosMethods from "../src/controllers/sistema/sistemas/modulos/methods/modulos.methods.js";
import * as procesosMethods from "../src/controllers/sistema/sistemas/procesos/methods/procesos.methods.js";

export const createAutorizacionTestContext = () => {
    const organizacionCtx = createOrganizacionTestContext();
    const trackedPerfilIds = new Set();
    const trackedModuloIds = new Set();
    const trackedProcesoIds = new Set();

    const trackPerfilId = (id) => {
        trackedPerfilIds.add(id.toString());
    };

    const trackModuloId = (id) => {
        trackedModuloIds.add(id.toString());
    };

    const trackProcesoId = (id) => {
        trackedProcesoIds.add(id.toString());
    };

    const cleanupTestData = async () => {
        const perfilesCollection = await perfilesMethods.getPerfilesCollection();
        const procesosCollection = await procesosMethods.getProcesosCollection();
        const modulosCollection = await modulosMethods.getModulosCollection();

        if (trackedProcesoIds.size > 0) {
            await procesosCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedProcesoIds, (id) => new ObjectId(id)),
                },
            });
            trackedProcesoIds.clear();
        }

        if (trackedModuloIds.size > 0) {
            await modulosCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedModuloIds, (id) => new ObjectId(id)),
                },
            });
            trackedModuloIds.clear();
        }

        if (trackedPerfilIds.size > 0) {
            await perfilesCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedPerfilIds, (id) => new ObjectId(id)),
                },
            });
            trackedPerfilIds.clear();
        }

        await organizacionCtx.cleanupTestData();
    };

    const teardownDatabase = async () => {
        await cleanupTestData();
        await organizacionCtx.teardownDatabase();
    };

    const createEmpresa = async ({
        nombre = `Empresa ${Date.now()}`,
        descripcion = "Empresa de prueba",
        usuarioRegistroId,
    }) => {
        const payload = empresasMethods.prepararRegistroEmpresa({ nombre, descripcion, usuarioRegistroId });
        const documento = empresasMethods.construirDocumentoNuevaEmpresa({
            ...payload,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const empresasCollection = await empresasMethods.getEmpresasCollection();
        const { insertedId } = await empresasCollection.insertOne(documento);
        organizacionCtx.trackEmpresaId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createSucursal = async ({
        empresaId,
        nombre = `Sucursal ${Date.now()}`,
        descripcion = "Sucursal de prueba",
        usuarioRegistroId,
    }) => {
        const payload = sucursalesMethods.prepararRegistroSucursal({ empresaId, nombre, descripcion, usuarioRegistroId });
        const fkEmpresaId = await sucursalesMethods.validarEmpresaSucursal(payload.empresaId);
        const documento = sucursalesMethods.construirDocumentoNuevaSucursal({
            ...payload,
            fkEmpresaId,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const sucursalesCollection = await sucursalesMethods.getSucursalesCollection();
        const { insertedId } = await sucursalesCollection.insertOne(documento);
        organizacionCtx.trackSucursalId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createDepartamento = async ({
        empresaId,
        sucursalId,
        nombre = `Departamento ${Date.now()}`,
        descripcion = "Departamento de prueba",
        usuarioRegistroId,
    }) => {
        const payload = departamentosMethods.prepararRegistroDepartamento({ empresaId, sucursalId, nombre, descripcion, usuarioRegistroId });
        const { fkEmpresaId, fkSucursalId } = await departamentosMethods.validarJerarquiaDepartamento({
            empresaId: payload.empresaId,
            sucursalId: payload.sucursalId,
        });
        const documento = departamentosMethods.construirDocumentoNuevoDepartamento({
            ...payload,
            fkEmpresaId,
            fkSucursalId,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const departamentosCollection = await departamentosMethods.getDepartamentosCollection();
        const { insertedId } = await departamentosCollection.insertOne(documento);
        organizacionCtx.trackDepartamentoId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createPerfil = async ({
        nombre = `Perfil ${Date.now()}`,
        descripcion = "Perfil de prueba",
        permisos = [],
        usuarioRegistroId,
    }) => {
        const payload = perfilesMethods.prepararRegistroPerfil({ nombre, descripcion, usuarioRegistroId });
        const documento = perfilesMethods.construirDocumentoNuevoPerfil({
            ...payload,
            permisos,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const perfilesCollection = await perfilesMethods.getPerfilesCollection();
        const { insertedId } = await perfilesCollection.insertOne(documento);
        trackPerfilId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createModulo = async ({
        nombre = "Sistemas",
        descripcion = "Modulo de prueba",
        tipo = "gestion",
        codigo = "sistemas",
        icono = "el-icon",
        usuarioRegistroId,
    }) => {
        const payload = modulosMethods.prepararRegistroModulo({ nombre, descripcion, tipo, codigo, icono, usuarioRegistroId });
        const documento = modulosMethods.construirDocumentoNuevoModulo({
            ...payload,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const modulosCollection = await modulosMethods.getModulosCollection();
        const { insertedId } = await modulosCollection.insertOne(documento);
        trackModuloId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createProceso = async ({
        moduloId,
        moduloNombre = "Sistemas",
        moduloTipo = "sistemas",
        moduloCodigo = "sistemas",
        nombre = "Inventario",
        descripcion = "Proceso de prueba",
        codigo = "inventario",
        ruta = `/sistema/${moduloNombre.toLowerCase()}/${nombre.toLowerCase()}`,
        icono = "inventory-icon",
        usuarioRegistroId,
    }) => {
        const payload = procesosMethods.prepararRegistroProceso({ moduloId, nombre, descripcion, codigo, ruta, icono, usuarioRegistroId });
        const documento = procesosMethods.construirDocumentoNuevoProceso({
            ...payload,
            fkModuloId: new ObjectId(moduloId),
            moduloCodigo,
            moduloNombre,
            moduloTipo,
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const procesosCollection = await procesosMethods.getProcesosCollection();
        const { insertedId } = await procesosCollection.insertOne(documento);
        trackProcesoId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
        };
    };

    const createAssignedUser = async ({
        nombre = "Miguel",
        apellido = "Rosales",
        telefono = "1234567890",
        email = `usuario.asignado.${Date.now()}@test.local`,
        password = "Abc12345!",
        empresaId,
        sucursalId,
        departamentoId,
        perfilId,
        usuarioRegistroId,
    }) => {
        const asignacion = usuariosMethods.construirAsignacionUsuario({
            fkEmpresaId: new ObjectId(empresaId),
            fkSucursalId: new ObjectId(sucursalId),
            fkDepartamentoId: new ObjectId(departamentoId),
            fkPerfilId: new ObjectId(perfilId),
            usuarioRegistroObjectId: new ObjectId(usuarioRegistroId),
        });
        const documento = await usuariosMethods.construirDocumentoNuevoUsuario({
            nombre,
            apellido,
            telefono,
            email,
            password,
            asignaciones: [asignacion],
        });
        const usuariosCollection = await usuariosMethods.getUsuariosCollection();
        const { insertedId } = await usuariosCollection.insertOne(documento);
        organizacionCtx.trackUserId(insertedId);

        return {
            insertedId,
            documento: {
                ...documento,
                _id: insertedId,
            },
            credenciales: {
                usuario: documento.email,
                password,
            },
        };
    };

    return {
        ...organizacionCtx,
        cleanupTestData,
        teardownDatabase,
        trackPerfilId,
        trackModuloId,
        trackProcesoId,
        createEmpresa,
        createSucursal,
        createDepartamento,
        createPerfil,
        createModulo,
        createProceso,
        createAssignedUser,
    };
};