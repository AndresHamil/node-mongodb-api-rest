import { Router } from "express";
import * as SucursalesController from "../../../controllers/sistema/organizacion/sucursales/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/organizacion/sucursales";

router.use(BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/registrarSucursal`, SucursalesController.registrarSucursal);

export { router };