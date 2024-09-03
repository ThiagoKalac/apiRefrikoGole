import { Router } from "express";
import { criarPedidoController } from "../controllers/pedido/criarPedido.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { criarPedidoSchema } from "../schema/pedido/criar.schema";
import { enviarComprovanteSchema } from "../schema/pedido/comprovante.schema";
import { enviarComprovanteController } from "../controllers/pedido/comprovante.controller";
import { PedidoVerificacao } from "../jobs/tasks/pedidoVerificacao.task";


const pedidoRouter = Router();


// inserir pedido saib
pedidoRouter.post('/criar_pedido', validadorDadosMiddleware(criarPedidoSchema),criarPedidoController)

//enviar comprovante no whatsapp do cliente
pedidoRouter.post('/enviar_comprovante',validadorDadosMiddleware(enviarComprovanteSchema),enviarComprovanteController)

pedidoRouter.get('/teste', async (req, res) =>{
    const dataAtual = new Date()
    const pedidos22 = new PedidoVerificacao(dataAtual.getDate(), 22)
    pedidos22.agendar()

    return res.status(200).json({data: dataAtual , dia: dataAtual.getDate()})
})

export {pedidoRouter};