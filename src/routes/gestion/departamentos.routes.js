import { Router } from "express";
import * as DepartamentosController from "../../controllers/sistema/organizacion/departamentos/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";
const router = Router()
const BASE_PATH = '/gestion/departamento/departamentos';

router.use(BASE_PATH, validarSesionActiva)

router.get(`${BASE_PATH}/consultarDepartamentos`, DepartamentosController.consultarDepartamentos);
router.post(`${BASE_PATH}/consultarDepartamento`, DepartamentosController.consultarDepartamento);
router.post(`${BASE_PATH}/consultarDepartamentosFiltros`, DepartamentosController.consultarDepartamentosFiltros);
router.post(`${BASE_PATH}/consultarDepartamentosFormulario`, DepartamentosController.consultarDepartamentosFormulario);
router.post(`${BASE_PATH}/registrarDepartamento`, DepartamentosController.registrarDepartamento);
router.put(`${BASE_PATH}/editarDepartamento`, DepartamentosController.editarDepartamento);
router.delete(`${BASE_PATH}/eliminarDepartamento`, DepartamentosController.eliminarDepartamento);





export { router }; 