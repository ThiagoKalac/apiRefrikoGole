import { Router } from "express";
import { infoProdutoController } from "../controllers/produto/infoProduto.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { validarProdutoExistenteMiddleware } from "../middlewares/validarProdutoExistente.middleware";
import { validarProdutoCadastradoMiddleware } from "../middlewares/validarProdutoCadastrado.middleware";
import { atualizarProdutoController } from "../controllers/produto/atualizarProduto.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { atualizarProdutoSchema } from "../schema/produto/atualizar.schema";
import { atualizarProdutoLimiter, infoProdutoLimiter } from "../limiters/produto.limiter";
import { validarPerfilAcessoMiddleware } from "../middlewares/validarPerfilAcesso.middleware";

const produtoRouter = Router();

//validar existencia do produto
produtoRouter.get('/consulta/:codigo',
    validarTokenMiddleware, 
    validarPerfilAcessoMiddleware(['gestao', 'faturamento']),
    validarProdutoExistenteMiddleware,
    infoProdutoLimiter,
    infoProdutoController
);

//atualizar produto
produtoRouter.post('/atualizar_prod/:codigo',
    validarTokenMiddleware, 
    validarPerfilAcessoMiddleware(['gestao', 'faturamento']),
    validarProdutoCadastradoMiddleware,
    validadorDadosMiddleware(atualizarProdutoSchema),
    atualizarProdutoLimiter,
    atualizarProdutoController
)

export {produtoRouter};