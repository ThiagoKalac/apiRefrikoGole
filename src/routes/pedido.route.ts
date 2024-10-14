import { Router } from "express";
import { criarPedidoController } from "../controllers/pedido/criarPedido.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { criarPedidoSchema } from "../schema/pedido/criar.schema";
import { enviarComprovanteSchema } from "../schema/pedido/comprovante.schema";
import { enviarComprovanteController } from "../controllers/pedido/comprovante.controller";
import { downloadRelatorioController } from "../controllers/pedido/downloadRelatorio.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { downloadRelatorioSchema } from "../schema/pedido/downloadRelatorio.schema";
import { validarTokenFixoMiddleware } from "../middlewares/validarTokenFixo.middleware";
import { criarPedidoLimiter, downloadRelatorioLimiter, enviarComprovanteLimiter } from "../limiters/pedido.limiter";
import { validarPerfilAcessoMiddleware } from "../middlewares/validarPerfilAcesso.middleware";

const pedidoRouter = Router();


// inserir pedido saib
pedidoRouter.post('/criar_pedido_saib',
    validarTokenMiddleware,
    validarPerfilAcessoMiddleware(['gestao, faturamento, rh']),
    validadorDadosMiddleware(criarPedidoSchema),
    criarPedidoLimiter,
    criarPedidoController
);

//enviar comprovante no whatsapp do cliente
pedidoRouter.post('/enviar_comprovante',
    validarTokenFixoMiddleware,
    validadorDadosMiddleware(enviarComprovanteSchema),
    enviarComprovanteLimiter,
    enviarComprovanteController
);

pedidoRouter.post('/download_relatorio', 
    validarTokenMiddleware,
    validarPerfilAcessoMiddleware(['rh']),
    validadorDadosMiddleware(downloadRelatorioSchema),
    downloadRelatorioLimiter,
    downloadRelatorioController
);


export {pedidoRouter};