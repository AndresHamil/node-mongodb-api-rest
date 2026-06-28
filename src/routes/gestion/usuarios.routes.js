import { Router } from "express";
import * as UsuariosController from "../../controllers/gestion/usuarios/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";

const router = Router()

router.use('/gestion/usuarios', validarSesionActiva)

router.post('/gestion/usuarios/registrarUsuario', UsuariosController.registrarUsuario)
router.put('/gestion/usuarios/editarUsuario', UsuariosController.editarUsuario)
router.delete('/gestion/usuarios/eliminarUsuario', UsuariosController.eliminarUsuario)
router.get('/gestion/usuarios/consultarUsuarios', UsuariosController.consultarUsuarios);
router.get('/gestion/usuarios/:id', UsuariosController.consultarUsuario);
router.post('/gestion/usuarios/consultarUsuario', UsuariosController.consultarUsuario);
router.post('/gestion/usuarios/consultarUsuariosFormulario', UsuariosController.consultarUsuariosFormulario);
router.post('/gestion/usuarios/consultarUsuariosFiltros', UsuariosController.consultarUsuariosFiltros);

export { router }; 