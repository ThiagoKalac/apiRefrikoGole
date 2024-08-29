import * as yup from 'yup';
import { IUsuarioAtualizacao } from '../../interface/usuario.interface';

const atualizarUsuarioSchema: yup.ObjectSchema<IUsuarioAtualizacao> = yup.object().shape({
    nome: yup.string().notRequired(),
    sobrenome: yup.string().notRequired(),
    whatsapp: yup.string()
        .min(14,'Numero Invalido, passar numero nesse formato ex: +5511999991111')
        .max(14,'Numero Invalido, passar numero nesse formato ex: +5511999991111')
        .notRequired(),
    sexo: yup.string()
        .oneOf(['masculino', 'feminino'], 'Sexo inválido, precisa ser "masculino" ou "feminino"')
        .notRequired(),
    senha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').notRequired(),
    confirma_senha: yup.string()
          .oneOf([yup.ref('senha'), null], 'As senhas devem coincidir')
          .notRequired(),
    perfil: yup.string().notRequired()
});


export {atualizarUsuarioSchema};