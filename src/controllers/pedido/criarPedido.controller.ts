import { Request, Response } from "express";
import { criarPedidoService } from "../../services/pedido/criarPedido.service";
import { ICriarPedidoRequest } from "../../interface/pedido.interface";



const criarPedidoController = async (req:Request, res:Response) => {
    const dadosPedidos:ICriarPedidoRequest = req.body
    const pedidosCriados = await criarPedidoService(dadosPedidos);
    return res.status(201).json(pedidosCriados);
}

export {criarPedidoController};