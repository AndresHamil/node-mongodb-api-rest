import { Router } from "express";
import * as DepartamentosController from "../../controllers/gestion/departamentos/index.js";
const router = Router()

router.get('/gestion/departamentos/consultarDepartamentos', DepartamentosController.consultarDepartamentos);
router.post('/gestion/departamentos/consultarDepartamento', DepartamentosController.consultarDepartamento);
router.post('/gestion/departamentos/consultarDepartamentosFiltros', DepartamentosController.consultarDepartamentosFiltros);
router.post('/gestion/departamentos/consultarDepartamentosFormulario', DepartamentosController.consultarDepartamentosFormulario);
router.post('/gestion/departamentos/registrarDepartamento', DepartamentosController.registrarDepartamento);
router.put('/gestion/departamentos/editarDepartamento', DepartamentosController.editarDepartamento);
router.delete('/gestion/departamentos/eliminarDepartamento', DepartamentosController.eliminarDepartamento);





export { router }; 