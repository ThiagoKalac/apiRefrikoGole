import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { loginSchema } from "../schema/sessao/login.schema";
import { loginController } from "../controllers/sessao/login.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { refreshController } from "../controllers/sessao/refresh.controllet";
import { validarTokenController } from "../controllers/sessao/validarToken.controllet";
import { validarTokenFixoMiddleware } from "../middlewares/validarTokenFixo.middleware";

const sessaoRouter = Router();

// rota de login
sessaoRouter.post("/login", validarTokenFixoMiddleware,validadorDadosMiddleware(loginSchema), loginController);

// rota validar token de acesso
sessaoRouter.get("/validar_token", validarTokenFixoMiddleware,validarTokenMiddleware, validarTokenController)

// rota para atualizar token de acesso e verificar o refresh token
sessaoRouter.get("/refresh_token", validarTokenFixoMiddleware,refreshController)

export{sessaoRouter};