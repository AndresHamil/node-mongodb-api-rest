import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as sucursalesMethods from "./methods/sucursales.methods.js";

export const registrarSucursal = async (req, res) => {
    try {
        const payload = sucursalesMethods.prepararRegistroSucursal(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });
        const sucursalesCollection = await sucursalesMethods.getSucursalesCollection();
        const esRegistroMasivo = sucursalesMethods.esRegistroMasivoSucursal(payload);
        const empresasObjetivo = sucursalesMethods.resolverEmpresasObjetivoRegistro(payload);
        const sucursalesPendientes = [];

        for (const empresaId of empresasObjetivo) {
            const fkEmpresaId = await sucursalesMethods.validarEmpresaSucursal(empresaId);

            await sucursalesMethods.validarDuplicadoSucursal(sucursalesCollection, {
                fkEmpresaId,
                nombreNormalizado: payload.nombreNormalizado,
            });

            sucursalesPendientes.push(sucursalesMethods.construirDocumentoNuevaSucursal({
                ...payload,
                fkEmpresaId,
                usuarioRegistroObjectId,
            }));
        }

        if (!esRegistroMasivo) {
            const nuevaSucursal = sucursalesPendientes[0];
            const { insertedId } = await sucursalesCollection.insertOne(nuevaSucursal);
            nuevaSucursal._id = insertedId;

            return res
                .status(201)
                .location(`/sistema/organizacion/sucursales/registrarSucursal`)
                .json(methods.crearRespuestaApi({
                    message: "Registro exitoso",
                    data: {
                        sucursal: sucursalesMethods.construirRespuestaSucursal(nuevaSucursal),
                    },
                }));
        }

        const resultadoInsercion = await sucursalesCollection.insertMany(sucursalesPendientes);
        const sucursalesRegistradas = sucursalesPendientes.map((sucursal, indice) => ({
            ...sucursal,
            _id: resultadoInsercion.insertedIds[indice],
        }));

        return res
            .status(201)
            .location(`/sistema/organizacion/sucursales/registrarSucursal`)
            .json(methods.crearRespuestaApi({
                message: "Registros exitosos",
                data: {
                    sucursales: sucursalesRegistradas.map((sucursal) => sucursalesMethods.construirRespuestaSucursal(sucursal)),
                },
            }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "sucursales.registrarSucursal",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};