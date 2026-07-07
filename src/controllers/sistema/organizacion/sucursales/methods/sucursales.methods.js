import { DB_COLLECTION_SUCURSALES } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";
import {
    construirDocumentoBaseOrganizacional,
    construirRespuestaOrganizacional,
    prepararPayloadBaseOrganizacional,
} from "../../../methods/organizacion.methods.js";
import * as empresasMethods from "../../empresas/methods/empresas.methods.js";

export const getSucursalesCollection = async () => getCollection(DB_COLLECTION_SUCURSALES);

export const buscarSucursalPorId = async (sucursalId) => {
    const objectId = utils.validarObjectId(sucursalId, "La", "sucursalId", true);
    const sucursalesCollection = await getSucursalesCollection();
    return sucursalesCollection.findOne({ _id: objectId });
};

export const prepararRegistroSucursal = (payload = {}) => {
    const payloadBase = prepararPayloadBaseOrganizacional(payload);
    const { empresaId = null, empresas = null } = payload;

    utils.validarTipoDato(empresaId, "La", "empresaId", "string");
    utils.validarTipoDato(empresas, "Las", "empresas", "array");

    if (empresaId && Array.isArray(empresas) && empresas.length > 0) {
        throw utils.crearErrorAplicacion({
            message: "Provide only empresaId or empresas.",
            customMessage: "Debes enviar solo empresaId o empresas, no ambos.",
            statusCode: 422,
            code: "CONTRATO_INVALIDO",
        });
    }

    if (!empresaId && (!Array.isArray(empresas) || empresas.length === 0)) {
        throw utils.crearErrorAplicacion({
            message: "At least one company is required.",
            customMessage: "Debes enviar empresaId o al menos un elemento en empresas.",
            statusCode: 422,
            code: "EMPRESA_REQUERIDA",
        });
    }

    const empresasNormalizadas = Array.isArray(empresas)
        ? empresas.map((item) => {
            utils.validarTipoDato(item, "La", "empresaId", "string");
            utils.validarRequerido(item, "La", "empresaId");
            return item.trim();
        })
        : null;

    if (empresasNormalizadas?.length) {
        const empresasUnicas = new Set(empresasNormalizadas);

        if (empresasUnicas.size !== empresasNormalizadas.length) {
            throw utils.crearErrorAplicacion({
                message: "Duplicated companies in payload.",
                customMessage: "No puedes repetir empresas dentro de la misma solicitud.",
                statusCode: 422,
                code: "EMPRESAS_DUPLICADAS",
            });
        }
    }

    return {
        ...payloadBase,
        empresaId: typeof empresaId === "string" ? empresaId.trim() : empresaId,
        empresas: empresasNormalizadas,
    };
};

export const esRegistroMasivoSucursal = (payload = {}) => Array.isArray(payload.empresas) && payload.empresas.length > 0;

export const resolverEmpresasObjetivoRegistro = (payload = {}) => (
    esRegistroMasivoSucursal(payload) ? payload.empresas : [payload.empresaId]
);

export const validarEmpresaSucursal = async (empresaId) => {
    const empresaObjectId = utils.validarObjectId(empresaId, "La", "empresaId", true);
    const empresa = await empresasMethods.buscarEmpresaPorId(empresaObjectId);

    if (!empresa || empresa.estado === false) {
        throw utils.crearErrorAplicacion({
            message: "Company not found.",
            customMessage: "La empresa indicada no existe o está inactiva.",
            statusCode: 404,
            code: "EMPRESA_NO_ENCONTRADA",
        });
    }

    return empresaObjectId;
};

export const validarDuplicadoSucursal = async (collection, { fkEmpresaId, nombreNormalizado }) => {
    const sucursalExistente = await collection.findOne({
        fkEmpresaId,
        nombreNormalizado,
    });

    if (!sucursalExistente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Branch already exists in company.",
        customMessage: "Ya existe una sucursal con el mismo nombre dentro de la empresa.",
        statusCode: 409,
        code: "SUCURSAL_DUPLICADA",
    });
};

export const construirDocumentoNuevaSucursal = ({ nombre, descripcion, nombreNormalizado, fkEmpresaId, usuarioRegistroObjectId }) => {
    return {
        ...construirDocumentoBaseOrganizacional({
            nombre,
            descripcion,
            nombreNormalizado,
            usuarioRegistroObjectId,
        }),
        fkEmpresaId,
    };
};

export const construirRespuestaSucursal = (sucursal) => {
    return construirRespuestaOrganizacional(sucursal, {
        empresaId: sucursal.fkEmpresaId?.toString?.() ?? null,
    });
};