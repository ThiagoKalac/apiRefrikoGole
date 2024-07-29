import * as yup from 'yup';
import { IProdutoComprovante } from '../../interface/comprovante.interface';

// Define o schema para o produto
const produtoComprovanteSchema:yup.ObjectSchema<IProdutoComprovante> = yup.object().shape({
    nome_produto: yup.string().required('nome: nome do produto é obrigatório'),
    qtd: yup.number().required('qtd : quantidade do produto é obrigatória'),
    valor_uni: yup.number().required('valor: valor unitario do produto é obrigatório'),
    valor_total: yup.number().required('total: do produto é obrigatório')
}).required();

// Define o schema para o comprovante
const enviarComprovanteSchema = yup.object().shape({
    whatsapp: yup.string()
        .matches(/^\+\d{13}$/, 'Número inválido, passar número nesse formato ex: +5511999991111')
        .required('whatsapp é obrigatório'),
    idPedido: yup.number().required('idPedido é obrigatório'),
    valorPedido: yup.number().required('valorPedido é obrigatório'),
    produtos: yup.array()
        .of(produtoComprovanteSchema)
        .ensure() // Garantir que é sempre um array
        .min(1, 'produtos deve conter pelo menos um produto')
        .required('produtos é obrigatório'),
    usuario: yup.string().required('usuario: Nome do usuario está cadastrado'),
    dataFaturamento: yup.string().required('dataFaturamento: data prevista do faturamento é obrigatório'),

}).required();

export { enviarComprovanteSchema };
