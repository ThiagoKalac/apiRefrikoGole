import { Router } from "express";
import { infoProdutoController } from "../controllers/produto/infoProduto.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { validarAdminMiddleware } from "../middlewares/validarAdmin.middeware";
import { validarProdutoExistenteMiddleware } from "../middlewares/validarProdutoExistente.middleware";
import { validarProdutoCadastradoMiddleware } from "../middlewares/validarProdutoCadastrado.middleware";
import { atualizarProdutoController } from "../controllers/produto/atualizarProduto.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { atualizarProdutoSchema } from "../schema/produto/atualizar.schema";

const produtoRouter = Router();

//validar existencia do produto
produtoRouter.get('/info_produto/:codigo',
    validarTokenMiddleware, 
    validarAdminMiddleware,
    validarProdutoExistenteMiddleware,
    infoProdutoController
);

//atualizar produto
produtoRouter.post('/atualizar/:codigo',
    validarTokenMiddleware, 
    validarAdminMiddleware,
    validarProdutoCadastradoMiddleware,
    validadorDadosMiddleware(atualizarProdutoSchema),
    atualizarProdutoController
)

export {produtoRouter};