import * as yup from 'yup';
import { ILogin } from '../../interface/sessao.interface';


const loginSchema:yup.ObjectSchema<ILogin> = yup.object().shape({
    cpf: yup.string().required("CPF é obrigatório"),
    senha: yup.string().required("Senha é obrigatório")
})


export {loginSchema};