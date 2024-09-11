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




const usuarioRouter = Router();

//rota para trazer informações do usuario na SENIOR e SAIB
usuarioRouter.get('/info_usuario/:cpf',
    validarCpfMiddleware,
    infoUsuarioController
);

//rota para cadastrar cliente
usuarioRouter.post('/cadastro', 
    validarCpfMiddleware,
    validarCpfExistenteMiddleware,
    validadorDadosMiddleware(cadastroUsuarioSchema),
    cadastroUsuarioController
);

//rota para gerar token para recuperar senha
usuarioRouter.post('/recuperar_senha/solicitar', 
    validarCpfMiddleware,
    recuperacaoSenhaSoliciarController
);

//rota para validar token de recuperação de senha
usuarioRouter.post('/recuperar_senha/validar', 
    validadorDadosMiddleware(recuperarSenhaValidarSchema),
    recuperacaoSenhaValidarController
);

//rota atualizacao senha do usuario na recuperacao de senha
usuarioRouter.post('/recuperar_senha/atualizar',
    validarTokenMiddleware,
    validadorDadosMiddleware(recuperarSenhaAtualizarSchema),
    recuperacaoSenhaAtualizarController
);

//rota atualizacao  usuario 
usuarioRouter.patch('/atualizar/:id',
    validarTokenMiddleware,
    validarExistenciaIdMiddleware,
    validarControleAcessoMiddleware,
    validadorDadosMiddleware(atualizarUsuarioSchema),
    atualizarUsuarioController
)

//rota para apagar usuario
usuarioRouter.delete('/deletar/:id',
    validarTokenMiddleware,
    validarExistenciaIdMiddleware,
    validarControleAcessoMiddleware,
    deletarUsuarioController
);

export {usuarioRouter};