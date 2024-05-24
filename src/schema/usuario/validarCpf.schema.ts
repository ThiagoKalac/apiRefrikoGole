import * as yup from 'yup';
import { IUsuarioCPF } from '../../interface/usuario.interface';

const validarCpfSchema: yup.ObjectSchema<IUsuarioCPF> = yup.object().shape({
    cpf: yup.string().matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, 'CPF Invalido')
    .required('CPF é obrigatório')
});

export {validarCpfSchema};