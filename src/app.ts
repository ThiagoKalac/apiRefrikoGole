import express from "express"
import 'express-async-errors';
import { usuarioRouter } from "./routes/usuario.route";
import { tratarError } from "./error/tratarError";


const app = express();
app.use(express.json());

app.use('/usuario', usuarioRouter);


app.use(tratarError);
export {app}