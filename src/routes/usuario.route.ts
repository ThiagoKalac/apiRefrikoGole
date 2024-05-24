import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { validarCpfSchema } from "../schema/usuario/vaalidarCpf.schema";

const usuarioRouter = Router();

//rota para verificar se o usuario é funcionario
usuarioRouter.get('/validar_cpf/:cpf',validadorDadosMiddleware(validarCpfSchema))

export {usuarioRouter}