import { Router } from "express";
import * as SucursalesController from "../../controllers/sistema/organizacion/sucursales/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";
const router = Router()
const BASE_PATH = '/gestion/sucursal/sucursales';

router.use(BASE_PATH, validarSesionActiva)

router.get(`${BASE_PATH}/consultarSucursales`, SucursalesController.consultarSucursales);
router.post(`${BASE_PATH}/consultarSucursal`, SucursalesController.consultarSucursal);
router.post(`${BASE_PATH}/consultarSucursalesFiltros`, SucursalesController.consultarSucursalesFiltros);
router.post(`${BASE_PATH}/consultarSucursalesFormulario`, SucursalesController.consultarSucursalesFormulario);
router.post(`${BASE_PATH}/registrarSucursal`, SucursalesController.registrarSucursal);
router.put(`${BASE_PATH}/editarSucursal`, SucursalesController.editarSucursal);
router.delete(`${BASE_PATH}/eliminarSucursal`, SucursalesController.eliminarSucursal);

export { router }; 