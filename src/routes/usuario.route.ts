import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { infoUsuarioController } from "../controllers/usuario/infoUsuario.Controller";

const usuarioRouter = Router();

//rota para trazer informações do usuario na SENIOR e SAIB
usuarioRouter.get('/info_usuario/:cpf',infoUsuarioController)

export {usuarioRouter}