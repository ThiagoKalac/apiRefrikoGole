import { Router } from "express";
import { criarPedidoController } from "../controllers/pedido/criarPedido.controller";
import { validadorDadosMiddleware } from "../middlewares/validadorDados.middleware";
import { criarPedidoSchema } from "../schema/pedido/criar.schema";

const pedidoRouter = Router();


// inserir pedido saib
pedidoRouter.post('/criar_pedido', validadorDadosMiddleware(criarPedidoSchema),criarPedidoController)


export {pedidoRouter};