// ----------------------------------------------------- [ SISTEMA ]
export { router as accesosSistemaRouter } from "./sistema/accesos/accesos.routes.js";
export { router as permisosSistemaRouter } from "./sistema/accesos/permisos.routes.js";
export { router as perfilesSistemaRouter } from "./sistema/accesos/perfiles.routes.js";
export { router as usuariosSistemaRouter } from "./sistema/accesos/usuarios.routes.js";
export { router as modulosRouter } from "./sistema/sistemas/modulos.routes.js";
export { router as procesosRouter } from "./sistema/sistemas/procesos.routes.js";
export { router as empresasSistemaRouter } from "./sistema/organizacion/empresas.routes.js";
export { router as sucursalesSistemaRouter } from "./sistema/organizacion/sucursales.routes.js";
export { router as departamentosSistemaRouter } from "./sistema/organizacion/departamentos.routes.js";
// ----------------------------------------------------- [ OTROS ]
export { router as sesionesRouter } from "./otros/sesiones/index.routes.js";
