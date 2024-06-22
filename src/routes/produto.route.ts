import { Router } from "express";
import { infoProdutoController } from "../controllers/produto/infoProduto.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { validarAdminMiddleware } from "../middlewares/validarAdmin.middeware";
import { validarProdutoExistenteMiddleware } from "../middlewares/validarProdutoExistente.middleware";

const produtoRouter = Router();

//validar existencia do produto
produtoRouter.get('/info_produto/:codigo',
    validarTokenMiddleware, 
    validarAdminMiddleware,
    validarProdutoExistenteMiddleware,
    infoProdutoController
);

produtoRouter.get('/atualizar/:codigo'
    
)

export {produtoRouter};