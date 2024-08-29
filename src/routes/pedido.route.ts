import { Router } from "express";
import { criarPedidoController } from "../controllers/pedido/criarPedido.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { criarPedidoSchema } from "../schema/pedido/criar.schema";
import { enviarComprovanteSchema } from "../schema/pedido/comprovante.schema";
import { enviarComprovanteController } from "../controllers/pedido/comprovante.controller";


const pedidoRouter = Router();


// inserir pedido saib
pedidoRouter.post('/criar_pedido', validadorDadosMiddleware(criarPedidoSchema),criarPedidoController)

//enviar comprovante no whatsapp do cliente
pedidoRouter.post('/enviar_comprovante',validadorDadosMiddleware(enviarComprovanteSchema),enviarComprovanteController)

export {pedidoRouter};