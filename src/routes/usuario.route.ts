import { Router } from "express";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";

import { validarCpfMiddleware } from "../middlewares/validarCpf.middleware";
import { cadastroUsuarioSchema } from "../schema/usuario/cadastroUsuario.schema";
import { cadastroUsuarioController } from "../controllers/usuario/cadastroUsuario.controller";
import { validarCpfExistenteMiddleware } from "../middlewares/validarCpfExistente.middleware";
import { 
    recuperacaoSenhaSoliciarController, 
    recuperacaoSenhaValidarController, 
    recuperacaoSenhaAtualizarController 
} from "../controllers/usuario/recuperacaoSenha.controller";
import { recuperarSenhaAtualizarSchema, recuperarSenhaValidarSchema } from "../schema/usuario/recuperarSenha.schema";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { atualizarUsuarioSchema } from "../schema/usuario/atualizarUsuario.schema";
import { validarExistenciaIdMiddleware } from "../middlewares/validarExistenciaId.middleware";
import { validarControleAcessoMiddleware } from "../middlewares/validarControleAcesso.middleware";
import { atualizarUsuarioController } from "../controllers/usuario/atualizarUsuario.controller";
import { infoUsuarioController } from "../controllers/usuario/infoUsuario.controller";
import { deletarUsuarioController } from "../controllers/usuario/deletarUsuario.controller";
import { notificarUsuarioController } from "../controllers/usuario/notificarUsuario.controller";
import { validarTokenFixoMiddleware } from "../middlewares/validarTokenFixo.middleware";
import { cadastroLimiter, infoUsuarioLimiter, notificarUsuarioLimiter, recuperacaoSenhaLimiter } from "../limiters/usuario.limiter";
import { usuariosAutenticadosLimiter } from "../limiters/global.limiter";




const usuarioRouter = Router();

//rota para trazer informações do usuario na SENIOR e SAIB
usuarioRouter.get('/info_ud/:cpf',
    validarTokenFixoMiddleware,
    validarCpfMiddleware,
    infoUsuarioLimiter,
    infoUsuarioController
);

//rota para cadastrar cliente
usuarioRouter.post('/gerar_acesso_unico', 
    validarTokenFixoMiddleware,
    validarCpfMiddleware,
    validarCpfExistenteMiddleware,
    validadorDadosMiddleware(cadastroUsuarioSchema),
    cadastroLimiter,
    cadastroUsuarioController
);

//rota para gerar token para recuperar senha
usuarioRouter.post('/chave_acesso/solicitar_recuperacao', 
    validarTokenFixoMiddleware,
    validarCpfMiddleware,
    recuperacaoSenhaLimiter,
    recuperacaoSenhaSoliciarController
);

//rota para validar token de recuperação de senha
usuarioRouter.post('/chave_acesso/solicitar_validacao', 
    validarTokenFixoMiddleware,
    validadorDadosMiddleware(recuperarSenhaValidarSchema),
    recuperacaoSenhaValidarController
);

//rota atualizacao senha do usuario na recuperacao de senha
usuarioRouter.post('/chave_acesso/reiniciar_acesso',
    validarTokenMiddleware,
    validadorDadosMiddleware(recuperarSenhaAtualizarSchema),
    recuperacaoSenhaAtualizarController
);

//rota atualizacao  usuario 
usuarioRouter.patch('/modificar/:id',
    validarTokenMiddleware,
    validarExistenciaIdMiddleware,
    validarControleAcessoMiddleware,
    validadorDadosMiddleware(atualizarUsuarioSchema),
    usuariosAutenticadosLimiter,
    atualizarUsuarioController
)

//rota para desativar usuario
usuarioRouter.delete('/remover_entrada/:id',
    validarTokenMiddleware,
    validarExistenciaIdMiddleware,
    validarControleAcessoMiddleware,
    usuariosAutenticadosLimiter,
    deletarUsuarioController
);

//rota para notificar usuarios do pedido liberado
usuarioRouter.get('/notificar_avs', 
    validarTokenMiddleware,
    notificarUsuarioLimiter,
    notificarUsuarioController
)

export {usuarioRouter};