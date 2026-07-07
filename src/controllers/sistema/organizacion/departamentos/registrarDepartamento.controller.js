import * as methods from "../../../../utils/methods.js";
import { registrarErrorEstructurado } from "../../../../utils/logger.js";
import * as organizacionMethods from "../../methods/organizacion.methods.js";
import * as departamentosMethods from "./methods/departamentos.methods.js";

export const registrarDepartamento = async (req, res) => {
    try {
        const payload = departamentosMethods.prepararRegistroDepartamento(req.body ?? {});
        const usuarioRegistroObjectId = await organizacionMethods.validarUsuarioRegistro({
            usuarioRegistroId: payload.usuarioRegistroId,
            usuarioSesionId: req.usuarioSesionId,
        });
        const departamentosCollection = await departamentosMethods.getDepartamentosCollection();
        const esRegistroMasivo = departamentosMethods.esRegistroMasivoDepartamento(payload);
        const sucursalesObjetivo = departamentosMethods.resolverSucursalesObjetivoRegistro(payload);
        const departamentosPendientes = [];
        let empresaRaizId = null;

        for (const sucursalId of sucursalesObjetivo) {
            const { fkEmpresaId, fkSucursalId } = await departamentosMethods.validarJerarquiaDepartamento({
                empresaId: payload.empresaId,
                sucursalId,
            });

            empresaRaizId = departamentosMethods.validarMismaEmpresaEnSucursales(fkEmpresaId, empresaRaizId);

            await departamentosMethods.validarDuplicadoDepartamento(departamentosCollection, {
                fkSucursalId,
                nombreNormalizado: payload.nombreNormalizado,
            });

            departamentosPendientes.push(departamentosMethods.construirDocumentoNuevoDepartamento({
                ...payload,
                fkEmpresaId,
                fkSucursalId,
                usuarioRegistroObjectId,
            }));
        }

        if (!esRegistroMasivo) {
            const nuevoDepartamento = departamentosPendientes[0];
            const { insertedId } = await departamentosCollection.insertOne(nuevoDepartamento);
            nuevoDepartamento._id = insertedId;

            return res
                .status(201)
                .location(`/sistema/organizacion/departamentos/registrarDepartamento`)
                .json(methods.crearRespuestaApi({
                    message: "Registro exitoso",
                    data: {
                        departamento: departamentosMethods.construirRespuestaDepartamento(nuevoDepartamento),
                    },
                }));
        }

        const resultadoInsercion = await departamentosCollection.insertMany(departamentosPendientes);
        const departamentosRegistrados = departamentosPendientes.map((departamento, indice) => ({
            ...departamento,
            _id: resultadoInsercion.insertedIds[indice],
        }));

        return res
            .status(201)
            .location(`/sistema/organizacion/departamentos/registrarDepartamento`)
            .json(methods.crearRespuestaApi({
                message: "Registros exitosos",
                data: {
                    departamentos: departamentosRegistrados.map((departamento) => departamentosMethods.construirRespuestaDepartamento(departamento)),
                },
            }));
    } catch (error) {
        registrarErrorEstructurado({
            error,
            contexto: "departamentos.registrarDepartamento",
            req,
        });

        return res.status(methods.obtenerStatusCodeError(error)).json(methods.crearRespuestaErrorApi(error));
    }
};