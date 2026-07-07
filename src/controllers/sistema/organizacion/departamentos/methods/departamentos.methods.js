import { DB_COLLECTION_DEPARTAMENTOS } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";
import {
    construirDocumentoBaseOrganizacional,
    construirRespuestaOrganizacional,
    prepararPayloadBaseOrganizacional,
} from "../../../methods/organizacion.methods.js";
import * as empresasMethods from "../../empresas/methods/empresas.methods.js";
import * as sucursalesMethods from "../../sucursales/methods/sucursales.methods.js";

export const getDepartamentosCollection = async () => getCollection(DB_COLLECTION_DEPARTAMENTOS);

export const buscarDepartamentoPorId = async (departamentoId) => {
    const objectId = utils.validarObjectId(departamentoId, "El", "departamentoId", true);
    const departamentosCollection = await getDepartamentosCollection();
    return departamentosCollection.findOne({ _id: objectId });
};

export const prepararRegistroDepartamento = (payload = {}) => {
    const payloadBase = prepararPayloadBaseOrganizacional(payload);
    const { empresaId = null, sucursalId = null, sucursales = null } = payload;

    utils.validarTipoDato(empresaId, "La", "empresaId", "string");
    utils.validarTipoDato(sucursalId, "La", "sucursalId", "string");
    utils.validarTipoDato(sucursales, "Las", "sucursales", "array");

    if (sucursalId && Array.isArray(sucursales) && sucursales.length > 0) {
        throw utils.crearErrorAplicacion({
            message: "Provide only sucursalId or sucursales.",
            customMessage: "Debes enviar solo sucursalId o sucursales, no ambos.",
            statusCode: 422,
            code: "CONTRATO_INVALIDO",
        });
    }

    if (!sucursalId && (!Array.isArray(sucursales) || sucursales.length === 0)) {
        throw utils.crearErrorAplicacion({
            message: "At least one branch is required.",
            customMessage: "Debes enviar sucursalId o al menos un elemento en sucursales.",
            statusCode: 422,
            code: "SUCURSAL_REQUERIDA",
        });
    }

    const sucursalesNormalizadas = Array.isArray(sucursales)
        ? sucursales.map((item) => {
            utils.validarTipoDato(item, "La", "sucursalId", "string");
            utils.validarRequerido(item, "La", "sucursalId");
            return item.trim();
        })
        : null;

    const sucursalIdNormalizada = typeof sucursalId === "string" ? sucursalId.trim() : sucursalId;

    if (sucursalesNormalizadas?.length) {
        const sucursalesUnicas = new Set(sucursalesNormalizadas);

        if (sucursalesUnicas.size !== sucursalesNormalizadas.length) {
            throw utils.crearErrorAplicacion({
                message: "Duplicated branches in payload.",
                customMessage: "No puedes repetir sucursales dentro de la misma solicitud.",
                statusCode: 422,
                code: "SUCURSALES_DUPLICADAS",
            });
        }
    }

    return {
        ...payloadBase,
        empresaId,
        sucursalId: sucursalIdNormalizada,
        sucursales: sucursalesNormalizadas,
    };
};

export const esRegistroMasivoDepartamento = (payload = {}) => Array.isArray(payload.sucursales) && payload.sucursales.length > 0;

export const resolverSucursalesObjetivoRegistro = (payload = {}) => (
    esRegistroMasivoDepartamento(payload) ? payload.sucursales : [payload.sucursalId]
);

export const validarJerarquiaDepartamento = async ({ empresaId, sucursalId }) => {
    const fkSucursalId = utils.validarObjectId(sucursalId, "La", "sucursalId", true);

    const sucursal = await sucursalesMethods.buscarSucursalPorId(fkSucursalId);

    if (!sucursal || sucursal.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Branch not found.",
            customMessage: "La sucursal indicada no existe o está inactiva.",
            statusCode: 404,
            code: "SUCURSAL_NO_ENCONTRADA",
        });
    }

    const fkEmpresaId = sucursal.fkEmpresaId;

    if (!fkEmpresaId) {
        throw utils.crearErrorAplicacion({
            message: "The branch does not have an associated company.",
            customMessage: "La sucursal indicada no tiene una empresa asociada.",
            statusCode: 422,
            code: "SUCURSAL_SIN_EMPRESA",
        });
    }

    const empresa = await empresasMethods.buscarEmpresaPorId(fkEmpresaId);

    if (!empresa || empresa.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Company not found.",
            customMessage: "La empresa asociada a la sucursal no existe o está inactiva.",
            statusCode: 404,
            code: "EMPRESA_NO_ENCONTRADA",
        });
    }

    if (empresaId) {
        const empresaEnviadaObjectId = utils.validarObjectId(empresaId, "La", "empresaId", true);

        if (fkEmpresaId?.toString?.() !== empresaEnviadaObjectId.toString()) {
            throw utils.crearErrorAplicacion({
                message: "The branch does not belong to the company.",
                customMessage: "La sucursal indicada no pertenece a la empresa enviada.",
                statusCode: 422,
                code: "JERARQUIA_INVALIDA",
            });
        }
    }

    return {
        fkEmpresaId,
        fkSucursalId,
    };
};

export const validarMismaEmpresaEnSucursales = (empresaActualId, empresaEsperadaId) => {
    if (!empresaEsperadaId) {
        return empresaActualId;
    }

    if (empresaEsperadaId.toString() !== empresaActualId.toString()) {
        throw utils.crearErrorAplicacion({
            message: "Branches must belong to the same company.",
            customMessage: "Todas las sucursales enviadas deben pertenecer a la misma empresa.",
            statusCode: 422,
            code: "SUCURSALES_EMPRESA_INVALIDA",
        });
    }

    return empresaEsperadaId;
};

export const validarDuplicadoDepartamento = async (collection, { fkSucursalId, nombreNormalizado }) => {
    const departamentoExistente = await collection.findOne({
        fkSucursalId,
        nombreNormalizado,
    });

    if (!departamentoExistente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Department already exists in branch.",
        customMessage: "Ya existe un departamento con el mismo nombre dentro de la sucursal.",
        statusCode: 409,
        code: "DEPARTAMENTO_DUPLICADO",
    });
};

export const construirDocumentoNuevoDepartamento = ({ nombre, descripcion, nombreNormalizado, fkEmpresaId, fkSucursalId, usuarioRegistroObjectId }) => {
    return {
        ...construirDocumentoBaseOrganizacional({
            nombre,
            descripcion,
            nombreNormalizado,
            usuarioRegistroObjectId,
        }),
        fkEmpresaId,
        fkSucursalId,
    };
};

export const construirRespuestaDepartamento = (departamento) => {
    return construirRespuestaOrganizacional(departamento, {
        empresaId: departamento.fkEmpresaId?.toString?.() ?? null,
        sucursalId: departamento.fkSucursalId?.toString?.() ?? null,
    });
};