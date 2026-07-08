import * as departamentosMethods from "../../../src/controllers/sistema/organizacion/departamentos/methods/departamentos.methods.js";
import * as empresasMethods from "../../../src/controllers/sistema/organizacion/empresas/methods/empresas.methods.js";
import * as sucursalesMethods from "../../../src/controllers/sistema/organizacion/sucursales/methods/sucursales.methods.js";
import { createMongoTestContext, createTrackedIds } from "../../shared/mongo-test-context.helpers.js";
import { createUsuariosTestContext } from "../accesos/usuarios.helpers.js";

export const createOrganizacionTestContext = () => {
    const usuariosContext = createUsuariosTestContext();
    const trackedEmpresaIds = createTrackedIds();
    const trackedSucursalIds = createTrackedIds();
    const trackedDepartamentoIds = createTrackedIds();

    const cleanupOwnData = async () => {
        const departamentosCollection = await departamentosMethods.getDepartamentosCollection();
        const sucursalesCollection = await sucursalesMethods.getSucursalesCollection();
        const empresasCollection = await empresasMethods.getEmpresasCollection();

        if (trackedDepartamentoIds.hasIds()) {
            await departamentosCollection.deleteMany({
                _id: {
                    $in: trackedDepartamentoIds.toObjectIds(),
                },
            });
            trackedDepartamentoIds.clear();
        }

        if (trackedSucursalIds.hasIds()) {
            await sucursalesCollection.deleteMany({
                _id: {
                    $in: trackedSucursalIds.toObjectIds(),
                },
            });
            trackedSucursalIds.clear();
        }

        if (trackedEmpresaIds.hasIds()) {
            await empresasCollection.deleteMany({
                _id: {
                    $in: trackedEmpresaIds.toObjectIds(),
                },
            });
            trackedEmpresaIds.clear();
        }
    };

    const mongoContext = createMongoTestContext({
        parentContext: usuariosContext,
        cleanupOwnData,
    });

    return {
        ...usuariosContext,
        ...mongoContext,
        trackEmpresaId: trackedEmpresaIds.trackId,
        trackSucursalId: trackedSucursalIds.trackId,
        trackDepartamentoId: trackedDepartamentoIds.trackId,
    };
};