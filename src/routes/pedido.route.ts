import { Router } from "express";
import { criarPedidoController } from "../controllers/pedido/criarPedido.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { criarPedidoSchema } from "../schema/pedido/criar.schema";
import { enviarComprovanteSchema } from "../schema/pedido/comprovante.schema";
import { enviarComprovanteController } from "../controllers/pedido/comprovante.controller";
import { PedidoVerificacao } from "../jobs/tasks/pedidoVerificacao.task";
import { downloadRelatorioController } from "../controllers/pedido/downloadRelatorio.controller";
import { validarTokenMiddleware } from "../middlewares/validarToken.middleware";
import { downloadRelatorioSchema } from "../schema/pedido/downloadRelatorio.schema";


const pedidoRouter = Router();


// inserir pedido saib
pedidoRouter.post('/criar_pedido', validadorDadosMiddleware(criarPedidoSchema),criarPedidoController)

//enviar comprovante no whatsapp do cliente
pedidoRouter.post('/enviar_comprovante',validadorDadosMiddleware(enviarComprovanteSchema),enviarComprovanteController)

pedidoRouter.post('/download_relatorio', 
    validarTokenMiddleware,
    validadorDadosMiddleware(downloadRelatorioSchema),
    downloadRelatorioController
)


export {pedidoRouter};