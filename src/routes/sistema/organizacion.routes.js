import { Router } from "express";
import * as OrganizacionEmpresasController from "../../controllers/sistema/organizacion/empresas/index.js";
import * as OrganizacionSucursalesController from "../../controllers/sistema/organizacion/sucursales/index.js";
import * as OrganizacionDepartamentosController from "../../controllers/sistema/organizacion/departamentos/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const EMPRESAS_BASE_PATH = "/sistema/organizacion/empresas";
const SUCURSALES_BASE_PATH = "/sistema/organizacion/sucursales";
const DEPARTAMENTOS_BASE_PATH = "/sistema/organizacion/departamentos";

router.use(EMPRESAS_BASE_PATH, validarSesionActiva);
router.use(SUCURSALES_BASE_PATH, validarSesionActiva);
router.use(DEPARTAMENTOS_BASE_PATH, validarSesionActiva);

router.get(`${EMPRESAS_BASE_PATH}/consultarEmpresas`, OrganizacionEmpresasController.consultarEmpresas);
router.post(`${EMPRESAS_BASE_PATH}/registrarEmpresa`, OrganizacionEmpresasController.registrarEmpresa);
router.post(`${SUCURSALES_BASE_PATH}/registrarSucursal`, OrganizacionSucursalesController.registrarSucursal);
router.post(`${DEPARTAMENTOS_BASE_PATH}/registrarDepartamento`, OrganizacionDepartamentosController.registrarDepartamento);

export { router };