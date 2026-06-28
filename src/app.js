import express from "express";
import * as rutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.use(rutes.modulosRouter);
app.use(rutes.procesosRouter);
app.use(rutes.perfilesRouter);
app.use(rutes.sucursalesRouter);
app.use(rutes.departamentosRouter);
app.use(rutes.usuariosRouter);
app.use(rutes.sesionesRouter);

export { app };