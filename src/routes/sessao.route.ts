import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { loginSchema } from "../schema/sessao/login.schema";
import { loginController } from "../controllers/sessao/login.controller";

const sessaoRouter = Router();

// rota de login

sessaoRouter.post("/login", validadorDadosMiddleware(loginSchema), loginController);

sessaoRouter.get("/validar_token")

export{sessaoRouter};