import * as yup from "yup";
import { ICriarPedidoRequest } from "../../interface/pedido.interface";

const criarPedidoSchema: yup.ObjectSchema<ICriarPedidoRequest> = yup.object().shape({
    dataInicio: yup.string().required('dataInicio: É obrigatório, ex: 25/06/2024'),
    dataFim: yup.string().required('dataFim: É obrigatório, ex: 25/06/2024'),
    cod_empresa: yup.number().required('cod_empresa: Código da empresa é obrigatório')
});

export {criarPedidoSchema};

