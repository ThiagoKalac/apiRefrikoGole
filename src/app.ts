import express from "express";
import 'express-async-errors';
import { usuarioRouter } from "./routes/usuario.route";
import { tratarError } from "./error/tratarError";
import { sessaoRouter } from "./routes/sessao.route";


const app = express();
app.use(express.json());

app.use('/usuario', usuarioRouter);
app.use('', sessaoRouter);

app.use(tratarError);

export {app};