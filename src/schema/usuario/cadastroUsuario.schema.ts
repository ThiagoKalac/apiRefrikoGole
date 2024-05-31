import * as yup from 'yup';
import { IUsuarioCriacao } from '../../interface/usuario.interface';

const cadastroUsuarioSchema: yup.ObjectSchema<IUsuarioCriacao> = yup.object().shape({
    cpf: yup.string().matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, 'CPF Invalido')
        .transform(value => value.replace(/[.-]/g, ''))
        .required('CPF é obrigatório'),
    nome: yup.string().max(50,'O número maximo de caracteres é 50').required('Nome é obrigatório'),
    sobrenome: yup.string().max(100,'O número maximo de caracteres é 100').required('Sobrenome é obrigatório'),
    sexo: yup.string().oneOf(['masculino, feminino'], 'Sexo inválido').required('Sexo é obrigatório'),
    setor: yup.string().required('Setor é obrigatório'),
    cargo: yup.string().required('Cargo é obrigatório'),
    empresa: yup.string().oneOf(['kompleto cambé, refriko campo grande, refriko dourados'], "Empresa inválida")
        .required('Empresa é obrigatório'),
    senha: yup.string().min(5, 'A senha deve ter pelo menos 8 caracteres').required('Senha é obrigatória'),
    confirma_senha: yup.string()
      .oneOf([yup.ref('senha'), null], 'As senhas devem coincidir')
      .required('Confirmação de senha é obrigatória'),
});

export {cadastroUsuarioSchema};
