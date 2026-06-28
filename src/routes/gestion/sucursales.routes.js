import { Router } from "express";
import * as SucursalesController from "../../controllers/gestion/sucursales/index.js";
const router = Router()

router.get('/gestion/sucursales/consultarSucursales', SucursalesController.consultarSucursales);
router.post('/gestion/sucursales/consultarSucursal', SucursalesController.consultarSucursal);
router.post('/gestion/sucursales/consultarSucursalesFiltros', SucursalesController.consultarSucursalesFiltros);
router.post('/gestion/sucursales/consultarSucursalesFormulario', SucursalesController.consultarSucursalesFormulario);
router.post('/gestion/sucursales/registrarSucursal', SucursalesController.registrarSucursal);
router.put('/gestion/sucursales/editarSucursal', SucursalesController.editarSucursal);
router.delete('/gestion/sucursales/eliminarSucursal', SucursalesController.eliminarSucursal);

export { router }; 