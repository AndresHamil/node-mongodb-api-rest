import { ObjectId } from "mongodb";
import { createUsuariosTestContext } from "./usuarios.helpers.js";
import * as empresasMethods from "../src/controllers/sistema/organizacion/empresas/methods/empresas.methods.js";
import * as sucursalesMethods from "../src/controllers/sistema/organizacion/sucursales/methods/sucursales.methods.js";
import * as departamentosMethods from "../src/controllers/sistema/organizacion/departamentos/methods/departamentos.methods.js";

export const createOrganizacionTestContext = () => {
    const usuariosCtx = createUsuariosTestContext();
    const trackedEmpresaIds = new Set();
    const trackedSucursalIds = new Set();
    const trackedDepartamentoIds = new Set();

    const trackEmpresaId = (id) => {
        trackedEmpresaIds.add(id.toString());
    };

    const trackSucursalId = (id) => {
        trackedSucursalIds.add(id.toString());
    };

    const trackDepartamentoId = (id) => {
        trackedDepartamentoIds.add(id.toString());
    };

    const cleanupTestData = async () => {
        const departamentosCollection = await departamentosMethods.getDepartamentosCollection();
        const sucursalesCollection = await sucursalesMethods.getSucursalesCollection();
        const empresasCollection = await empresasMethods.getEmpresasCollection();

        if (trackedDepartamentoIds.size > 0) {
            await departamentosCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedDepartamentoIds, (id) => new ObjectId(id)),
                },
            });
            trackedDepartamentoIds.clear();
        }

        if (trackedSucursalIds.size > 0) {
            await sucursalesCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedSucursalIds, (id) => new ObjectId(id)),
                },
            });
            trackedSucursalIds.clear();
        }

        if (trackedEmpresaIds.size > 0) {
            await empresasCollection.deleteMany({
                _id: {
                    $in: Array.from(trackedEmpresaIds, (id) => new ObjectId(id)),
                },
            });
            trackedEmpresaIds.clear();
        }

        await usuariosCtx.cleanupTestData();
    };

    const teardownDatabase = async () => {
        await cleanupTestData();
        await usuariosCtx.teardownDatabase();
    };

    return {
        ...usuariosCtx,
        cleanupTestData,
        teardownDatabase,
        trackEmpresaId,
        trackSucursalId,
        trackDepartamentoId,
    };
};