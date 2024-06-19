import { IUsuarioValidarRecuperacaoSenha, IUsuarioAtualizarRecuperacaoSenha } from "../../interface/usuario.interface";
import * as yup from 'yup';


const recuperarSenhaValidarSchema:yup.ObjectSchema<IUsuarioValidarRecuperacaoSenha> = yup.object().shape({
    cpf: yup.string()
        .min(11,"CPF com menos de 11 caracteres")
        .max(11,"Digite somente os números, sem traço ou ponto")
        .required("CPF: é obrigatório"),
    token: yup.string()
        .min(5,"Token inserido é ínvalido, com menos de 5 caracteres")
        .max(5,"Token ínvalido, no máximo 5 caracteres")
        .required("token: é obrigatório")
})

const recuperarSenhaAtualizarSchema:yup.ObjectSchema<IUsuarioAtualizarRecuperacaoSenha> = yup.object().shape({
    senha: yup.string()
        .min(5,"Mínimo de 5 caracteres")
        .required("Senha: é obrigatório"),
    confirma_senha: yup.string()
        .oneOf([yup.ref('senha'), null], 'As senhas devem coincidir')
        .required('confirma_senha: é obrigatória'),
})


export {recuperarSenhaValidarSchema, recuperarSenhaAtualizarSchema};