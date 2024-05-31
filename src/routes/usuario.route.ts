import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { infoUsuarioController } from "../controllers/usuario/infoUsuario.Controller";
import { validarCpfMiddleware } from "../middlewares/validarCpf.middleware";

const usuarioRouter = Router();

//rota para trazer informações do usuario na SENIOR e SAIB
usuarioRouter.get('/info_usuario/:cpf',validarCpfMiddleware,infoUsuarioController);

//rota para cadastrar cliente
usuarioRouter.post('/cadastro');

//

export {usuarioRouter}