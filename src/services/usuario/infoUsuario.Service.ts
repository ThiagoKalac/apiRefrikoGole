import { DataSourceOracle, DataSourcePostGree } from "../../data-source";
import { Funcionarios } from "../../entity/Funcionarios";
import { AppError } from "../../error/appError";
import { tipoLog } from "../../interface/log.interface";
import { IRespostaInfoUsuario } from "../../interface/usuario.interface";
import { Logging } from "../../log/loggin";


const infoUsuarioService = async (cpf: string):Promise<IRespostaInfoUsuario> => {
    
    try {
        let informacoesUsuario = {};
        const infoFuncionario = await infoUsuarioRh(cpf)
        const infoSaib = await infoUsuarioSaib(infoFuncionario.cpf, infoFuncionario.cod_empresa)
       
        informacoesUsuario = {
            ...infoFuncionario,
            ...infoSaib 
        } 

        await Logging.registrarLog({
            mensagem: 'Sucesso rota GET /info_usuario/:cpf',
            stack: 'back-end',
            tipo_log: tipoLog.INFO,
            usuario: null,
            dados_adicionais: `Sucesso ao puxar informações para o CPF ${cpf}, ${infoFuncionario.nome} ${infoFuncionario.sobrenome}, empresa: ${infoFuncionario.cod_empresa}`,
            stack_trace: null
        })
    
        return informacoesUsuario as IRespostaInfoUsuario;
        
    } catch (error) {
        if(error instanceof AppError){
            await Logging.registrarLog({
                mensagem: 'Erro controlado - rota GET /info_usuario/:cpf',
                stack: 'back-end',
                tipo_log: tipoLog.INFO,
                usuario: null,
                dados_adicionais: `Tentativa de puxar informações para o CPF ${cpf}`,
                stack_trace: Logging.formatarObjStackTraceErro(error)
            })
            throw error;
        }else {
            await Logging.registrarLog({
                mensagem: 'Erro service - rota GET /info_usuario/:cpf',
                stack: 'back-end',
                tipo_log: tipoLog.ERRO,
                usuario: null,
                dados_adicionais: `Erro na Tentativa de puxar informações para o CPF ${cpf}`,
                stack_trace: Logging.formatarObjStackTraceErro(error)
            })

            throw new AppError('Erro inesperado no servicor', 500)
        }
    }
}





const infoUsuarioRh = async(cpf:string) => {

    const funcionariosRepositorio = DataSourcePostGree.getRepository(Funcionarios);
    const funcionario = await funcionariosRepositorio.findOne({
        where:{
            cpf: cpf
        }
    })
    
    if(!funcionario){
        throw new AppError("Não é funcionário do Grupo Refriko, não pode realizar cadastro", 403)
    }

    const empresaNome = {
        42: 'refriko campo grande',
        43: 'refriko dourados',
        22: 'refriko cambé',
        124: 'refriko curitiba',
        26: 'refriko cascavel'
    }

    
    
    return {
        cpf: funcionario.cpf,
        nome: funcionario.nome.split(" ")[0].toLowerCase(),
        sobrenome:funcionario.nome.split(" ").slice(1).join(" ").toLowerCase(),
        sexo: funcionario.sexo == 'M' ? 'masculino' :  'feminino',
        cargo: funcionario.cargoNome.toLowerCase(),
        empresa: empresaNome[parseInt(funcionario.id_empresa_saib)],
        cod_empresa : parseInt(funcionario.id_empresa_saib),
        credito:  Number(parseFloat(funcionario.limite).toFixed(2)),
        nome_empresa_senior: funcionario.filialNome,
        cnpj_empresa: funcionario.cnpj,
        id_usuario_senior: +funcionario.id_funcionario,
        id_empresa_senior: +funcionario.filialCodigo,
        usuario_pj: funcionario.id_tipo_funcionario === 1 ? false : true 
    }  
    
}


const infoUsuarioSaib = async (cpf, empId) => {
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');


    const respostaSaib = await DataSourceOracle
        .createQueryBuilder()
        .select([`
            C.CLI_ID AS COD_SAIB,
            CV.CLIV_GEN_ID AS ROTA,
            C.CLI_EMP_ID AS EMP_ID,
            C.CLI_CGC_CPF AS CPF,
            C.CLI_RAZAO_SOCIAL AS NOME,
            C.CLI_OBS
        `])
        .from('CLIENTE' , 'C')
        .innerJoin('CLIENTE_V', 'CV', 'CV.CLIV_CLI_EMP_ID = C.CLI_EMP_ID AND CV.CLIV_CLI_ID = C.CLI_ID')
        .where(`C.CLI_CGC_CPF = :cpf`,{cpf:cpfFormatado})
        .andWhere(`C.CLI_EMP_ID = :empId`, {empId: empId})
        .getRawMany()

    if(respostaSaib.length == 0) throw new AppError(`Colaborador não cadastrado na SAIB, solicitar a recepção pare realizar seu cadastro na empresa ${empId}! Depois tente novamente.`, 404);
    
    const rotaPorEmpresa = {
        42: 603,
        43: 603,
        22: 53,
        124: 53,
        26: 53
    }
    
    let rotaValida = false;
    let registroValido;
    
                      

    for (let info of respostaSaib){

        if(info.ROTA == rotaPorEmpresa[empId]){
            rotaValida = true;
            registroValido = info;
            break;
        }
    }

    if (!rotaValida) throw new AppError(`Está cadastrado na ROTA ${respostaSaib[0].ROTA}, falar com a recepção para alterar o cadastro da rota para ${rotaPorEmpresa[empId]}`, 404);
    
    return {codigo_saib: registroValido.COD_SAIB}
}


export {infoUsuarioService};