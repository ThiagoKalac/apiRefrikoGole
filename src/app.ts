import express from "express"
import 'express-async-errors';
import { usuarioRouter } from "./routes/usuario.route";
import { tratarError } from "./error/tratarError";


const app = express();
app.use(express.json());
app.use(tratarError);

app.use('/usuario', usuarioRouter);


export {app}