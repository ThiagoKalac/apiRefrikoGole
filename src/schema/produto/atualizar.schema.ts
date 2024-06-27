import * as yup from "yup";
import { IProdutoAtualizar } from "../../interface/produto.interface";

const atualizarProdutoSchema: yup.ObjectSchema<IProdutoAtualizar> = yup.object().shape({
    nome: yup.string().notRequired().typeError("Nome deve ser uma string"),
    rotulo: yup.string().max(400, "Maximo de caracteres é 400").notRequired(),
    teor_alcoolico: yup.string().notRequired(),
    pais_fabricacao: yup.string().notRequired(),
    urlFoto: yup.string().url("URL inválida").notRequired()
});

export {atualizarProdutoSchema};