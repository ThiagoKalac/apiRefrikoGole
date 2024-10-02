import { Router } from "express";
import { infoProdutoController } from "../controllers/produto/infoProduto.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { validarAdminMiddleware } from "../middlewares/validarAdmin.middeware";
import { validarProdutoExistenteMiddleware } from "../middlewares/validarProdutoExistente.middleware";
import { validarProdutoCadastradoMiddleware } from "../middlewares/validarProdutoCadastrado.middleware";
import { atualizarProdutoController } from "../controllers/produto/atualizarProduto.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { atualizarProdutoSchema } from "../schema/produto/atualizar.schema";
import { atualizarProdutoLimiter, infoProdutoLimiter } from "../limiters/produto.limiter";

const produtoRouter = Router();

//validar existencia do produto
produtoRouter.get('/info_produto/:codigo',
    validarTokenMiddleware, 
    validarAdminMiddleware,
    validarProdutoExistenteMiddleware,
    infoProdutoLimiter,
    infoProdutoController
);

//atualizar produto
produtoRouter.post('/atualizar/:codigo',
    validarTokenMiddleware, 
    validarAdminMiddleware,
    validarProdutoCadastradoMiddleware,
    validadorDadosMiddleware(atualizarProdutoSchema),
    atualizarProdutoLimiter,
    atualizarProdutoController
)

export {produtoRouter};