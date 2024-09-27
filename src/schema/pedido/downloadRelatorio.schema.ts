import * as yup from "yup";
import { IDownLoadRelatorioRequest } from "../../interface/pedido.interface";

const downloadRelatorioSchema:yup.ObjectSchema<IDownLoadRelatorioRequest> = yup.object().shape({
    dataInicio: yup.string().required('dataInicio: É obrigatório, ex: 2024-09-20'),
    dataFim: yup.string().required('dataFim: É obrigatório, ex: 2024-09-23'),
    cod_empresa: yup.number().required('cod_empresa: Código da empresa é obrigatório')
});

export {downloadRelatorioSchema};

