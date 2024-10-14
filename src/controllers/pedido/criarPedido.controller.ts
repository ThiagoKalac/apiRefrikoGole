import { Request, Response } from "express";
import { criarPedidoService } from "../../services/pedido/criarPedido.service";
import { ICriarPedidoRequest } from "../../interface/pedido.interface";



const criarPedidoController = async (req:Request, res:Response) => {
    const dadosPedidos:ICriarPedidoRequest = req.body
    const pedidosCriados = await criarPedidoService(dadosPedidos);
    const statsCode = Object.keys(pedidosCriados).includes("mensagem") ? 200 : 201;
    return res.status(statsCode).json(pedidosCriados);
}

export {criarPedidoController};