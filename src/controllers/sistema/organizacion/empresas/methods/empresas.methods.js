import { DB_COLLECTION_EMPRESAS } from "../../../../../config.js";
import { getCollection } from "../../../../../db.js";
import * as utils from "../../../../../utils/methods.js";
import {
    construirDocumentoBaseOrganizacional,
    construirRespuestaOrganizacional,
    prepararPayloadBaseOrganizacional,
} from "../../../methods/organizacion.methods.js";

export const getEmpresasCollection = async () => getCollection(DB_COLLECTION_EMPRESAS);

export const buscarEmpresaPorId = async (empresaId) => {
    const objectId = utils.validarObjectId(empresaId, "La", "empresaId", true);
    const empresasCollection = await getEmpresasCollection();
    return empresasCollection.findOne({ _id: objectId });
};

export const prepararRegistroEmpresa = (payload = {}) => prepararPayloadBaseOrganizacional(payload);

export const validarDuplicadoEmpresa = async (collection, { nombreNormalizado }) => {
    const empresaExistente = await collection.findOne({ nombreNormalizado });

    if (!empresaExistente) {
        return;
    }

    throw utils.crearErrorAplicacion({
        message: "Company already exists.",
        customMessage: "Ya existe una empresa con el mismo nombre.",
        statusCode: 409,
        code: "EMPRESA_DUPLICADA",
    });
};

export const construirDocumentoNuevaEmpresa = ({ nombre, descripcion, nombreNormalizado, usuarioRegistroObjectId }) => {
    return construirDocumentoBaseOrganizacional({
        nombre,
        descripcion,
        nombreNormalizado,
        usuarioRegistroObjectId,
    });
};

export const construirRespuestaEmpresa = (empresa) => construirRespuestaOrganizacional(empresa);