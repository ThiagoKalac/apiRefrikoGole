import { DataSourceOracle, DataSourcePostGree } from "../../data-source";
import { AppError } from "../../error/appError";
import { validarCpfSchema } from "../../schema/usuario/validarCpf.schema";

const infoUsuarioService = async (cpf: string) => {
    let informacoesUsuario = {};
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const cpfValidado = await validarCpf(cpfFormatado);
    
    const infoFuncionario = await infoUsuarioRh(cpfValidado)
    const infoSaib = await infoUsuarioSaib(cpfValidado,42)

    informacoesUsuario = {
        cpf: infoSaib.cpf,
        cod_saib: infoSaib.cod_saib
    }
      
    return informacoesUsuario;
}


const validarCpf = async(cpf) => {
    try {
        const cpfValidado = await validarCpfSchema.validate({ cpf: cpf }, { abortEarly: false , stripUnknown: true, });
        return cpfValidado
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new AppError(error.errors,400);
        }
        throw new AppError('Erro desconhecido ao validar CPF',400);
    }   
} 


const infoUsuarioRh = async(cpf) => {
    try{

        const teste = DataSourcePostGree.createQueryRunner();
        const tabela = await teste.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'PBI' AND table_name = 'FUNCIONARIOS'
        `)
    
        console.log("Tabelas :", tabela);
    
        await teste.release();
        await DataSourcePostGree.destroy();
    }catch(error){
        console.error("Erro ao listar as tabelas:", error);
    }
}


const infoUsuarioSaib = async (cpf, empId=42) => {
    const resultadoSaib = await DataSourceOracle
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
        .where(`C.CLI_CGC_CPF = :cpf`,{cpf:cpf.cpf})
        .andWhere(`C.CLI_EMP_ID = :empId`, {empId: empId})
        .getRawMany()

    // 
    if(!resultadoSaib){
    throw new AppError("Usuario não cadastrado na SAIB", 404)
    }

    console.log(resultadoSaib);
    if(resultadoSaib[0].SAIB != 603){
    throw new AppError(`Está cadastrado na ROTA ${resultadoSaib[0].SAIB}, falar com o pessoal do cadastro para alterar para 603`, 401)
    }

    return {cod_saib: resultadoSaib[0].COD_SAIB, cpf:resultadoSaib[0].CPF}
}


export {infoUsuarioService};