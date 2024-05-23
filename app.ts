import express from "express"
import 'express-async-errors';
import { tratarError } from "./error/tratarError";
import { Agenda } from "./tasks/agendador";


const app = express()
app.use(express.json())
app.use(tratarError)

Agenda.iniciarTarefas()


export {app}