import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as empresasMethods from "./methods/empresas.methods.js";
import * as sucursalesMethods from "../sucursales/methods/sucursales.methods.js";

export const consultarEmpresas = async (req, res) => {
    try {
        const empresasCollection = await empresasMethods.getEmpresasCollection();
        const sucursalesCollection = await sucursalesMethods.getSucursalesCollection();
        const empresas = await empresasCollection
            .find({})
            .sort({ fechaRegistro: -1, _id: -1 })
            .toArray();

        const empresasConResumen = await Promise.all(empresas.map(async (empresa) => {
            const numeroSucursales = await sucursalesCollection.countDocuments({
                fkEmpresaId: empresa._id,
                estado: { $ne: false },
            });

            return {
                ...empresasMethods.construirRespuestaEmpresa(empresa),
                numeroSucursales,
            };
        }));

        return res.status(200).json(methods.crearRespuestaApi({
            message: "Consulta exitosa",
            data: empresasConResumen,
            totalCount: empresas.length,
        }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "empresas.consultarEmpresas",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error, { totalCount: 0 }));
    }
};