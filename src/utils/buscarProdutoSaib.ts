import { DataSourceOracle } from "../data-source";
import { AppError } from "../error/appError";
import { IEmpresaProduto, IProdutoRespFormatada, IProdutoSaibResp } from "../interface/produto.interface";


class ProdutoServico {
    static async buscarProduto(codigo:number):Promise<IProdutoRespFormatada>{
        const respSaib: IProdutoSaibResp[] = await DataSourceOracle
        .createQueryBuilder()
        .select([`
            P.PROD_ID AS COD_PRODUTO,
            P.PROD_EMP_ID AS COD_EMP,
            P.PROD_DESC AS NOME,
            P.PROD_UN_VDA AS FD_CX,
            P.PROD_COMPL_2,
            P.PROD_COMPL_3,
            TP.TPRC_GEN_ID AS TABELA,
            MAX(TP.TPRC_DTA_VIGENCIA) AS DATA_VIGENCIA,
            MAX(TP.TPRC_DTA_VALIDADE) AS DATA_VALIDADE,
            TP.TPRC_PRC_FINAL AS VALOR,
            PC.PROC_LITRAGEM AS LITRAGEM,
            PC.PROC_FATOR_CX AS FATOR_CX,
            PC.PROC_GEN_ID_MARCA_DE AS COD_MARCA,
            G.GEN_DESCRICAO AS NOME_MARCA,
            GS.GEN_DESCRICAO AS SABOR
        `])
        .from('PRODUTO', 'P')
        .innerJoin('TAB_PRECO', 'TP', 'TP.TPRC_PROD_EMP_ID = P.PROD_EMP_ID AND TP.TPRC_PROD_ID = P.PROD_ID')
        .innerJoin('PRODUTO_C', 'PC', 'PC.PROC_PROD_ID = P.PROD_ID AND PC.PROC_PROD_EMP_ID = P.PROD_EMP_ID')
        .innerJoin('GENER', 'G','G.GEN_TGEN_ID= PC.PROC_GEN_TGEN_ID_MARCA_DE AND G.GEN_EMP_ID= PC.PROC_GEN_EMP_ID_MARCA_DE AND G.GEN_ID= PC.PROC_GEN_ID_MARCA_DE')
        .innerJoin('GENER', 'GS','GS.GEN_TGEN_ID = PC.PROC_GEN_TGEN_ID_SABOR_DE AND GS.GEN_EMP_ID = PC.PROC_GEN_EMP_ID_SABOR_DE AND GS.GEN_ID = PC.PROC_GEN_ID_SABOR_DE')
        .where('TP.TPRC_GEN_ID = 15')
        .andWhere('P.PROD_ID = :prodId', {prodId: codigo})
        .andWhere('P.PROD_EMP_ID in (2,26,42,43,6)')
        .andWhere(`TP.TPRC_DTA_VIGENCIA = (
                SELECT 
                    MAX(TP2.TPRC_DTA_VIGENCIA) 
                FROM 
                    TAB_PRECO TP2 
                WHERE TP2.TPRC_GEN_ID = 15
                AND TP2.TPRC_PROD_ID = P.PROD_ID
                AND TP2.TPRC_PROD_EMP_ID = P.PROD_EMP_ID
            )
        `)
        .groupBy('P.PROD_ID')
        .addGroupBy('P.PROD_EMP_ID')
        .addGroupBy('P.PROD_DESC')
        .addGroupBy('P.PROD_UN_VDA')
        .addGroupBy('P.PROD_COMPL_2')
        .addGroupBy('P.PROD_COMPL_3')
        .addGroupBy('TP.TPRC_GEN_ID')
        .addGroupBy('TP.TPRC_PRC_FINAL')
        .addGroupBy('PC.PROC_LITRAGEM')
        .addGroupBy('PC.PROC_FATOR_CX')
        .addGroupBy('PC.PROC_GEN_ID_MARCA_DE')
        .addGroupBy('G.GEN_DESCRICAO')
        .addGroupBy('GS.GEN_DESCRICAO')
        .addGroupBy('PC.PROC_GEN_ID_SABOR_DE')
        .getRawMany();

        
        if(respSaib.length == 0){
            throw new AppError('Produto não existe ou não é liberado para cadastro para venda as colaborades',404)
        }

        const respFormatada = this.tratarRespostaSaib(respSaib)

        return respFormatada;
    }

    private static tratarRespostaSaib = (listaProduto:IProdutoSaibResp[]):IProdutoRespFormatada=>{   
        const empresas:IEmpresaProduto[] = []
        let contador:number = 0
    
        listaProduto.forEach(produto => {
            const dataValida = this.validarDataVigencia(produto.DATA_VIGENCIA, produto.DATA_VALIDADE);
            if(!dataValida) {
                contador++
            }
    
            const nomeEmpresas = {
                6  : 'Curitiba/PR',
                2 : 'Cambé/PR',
                26 : 'Cascavel/PR',
                42 : 'Campo Grande/MS',
                43 : 'Dourado/MS'
            }
    
            empresas.push({cod_emp: produto.COD_EMP, data_valida: dataValida, valor: produto.VALOR, nome:nomeEmpresas[produto.COD_EMP]}) 
        });
    
        if(contador == listaProduto.length) throw new AppError(`Produto com vigência vencida`, 403)
    
        const categoria = this.identificarCategoria(listaProduto[0].COD_MARCA);
      
        return {
            cod: listaProduto[0].COD_PRODUTO,
            nome: this.formatarNome(listaProduto[0].NOME),
            id_categoria: categoria.idCategoria,
            categoria: categoria.nome,
            litragem: listaProduto[0].LITRAGEM,
            fd_cx: this.formatarConversor(listaProduto[0].FD_CX, listaProduto[0].FATOR_CX),
            sub_categoria: this.formartarSubcategoria(listaProduto[0].SABOR),
            empresas
        }
       
    }

    static validarDataVigencia = (dataVigencia:Date, dataValidade:Date) : boolean=> {
        if(dataVigencia < dataValidade) return true
    
        return false
    }

    static formatarNome = (produtoNome:string):string => {
        let nomeFormatado = produtoNome.replace(/^EN\.\s*/, '');
    
        // Remover números antes do "X"
        nomeFormatado = nomeFormatado.replace(/(\d+)X/g, ' ');
    
        // Remover espaços extras
        nomeFormatado = nomeFormatado.trim().replace(/\s{2,}/g, ' ').toLowerCase();
        
        let palavras = nomeFormatado.split(' ');
        palavras = palavras.map(palavra => {
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        });

        return palavras.join(' ');
    }

    static identificarCategoria = (idCategoira:number):{idCategoria: number; nome:string} => {
    
        const categoriaSaib = {
            2: {idCategoria: 2 , nome: 'Refrigerante'},
            3: {idCategoria: 2 , nome: 'Refrigerante'},
            96: {idCategoria: 3 , nome: 'Energético'},
            82: {idCategoria: 4 , nome: 'Destilado'},
            84: {idCategoria: 6 , nome: 'Água'},
            83: {idCategoria: 4 , nome: 'Destilado'},
            97: {idCategoria: 7 , nome: 'Outros'},
            1121: {idCategoria: 4 , nome:'Destilado'},
            1112: {idCategoria: 8 , nome:'Coquetel'},
            1111: {idCategoria: 6, nome: 'Água'},
            1118: {idCategoria: 8, nome: 'Coquetel'},
            1006: {idCategoria: 1, nome: 'Cerveja'},
            1004: {idCategoria: 1, nome: 'Cerveja'},
            1114: {idCategoria: 5, nome: 'Chopp'}
        }

        if(!categoriaSaib[idCategoira]){
            return {idCategoria: 7, nome: 'Outros'};
        }
        
        return categoriaSaib[idCategoira]
    }

    static formatarConversor = (unidadeVenda:string, qtd:number):string => {
    
        const conversorFormatado = {
            JG: 'Jg d/mesa',
            UN: 'Unidade',
            CX: `Cx c/${qtd}`,
            FD: `Fd c/${qtd}`
        }
        
        return conversorFormatado[unidadeVenda]  || 'N/A';
    }

    static formartarSubcategoria = (subCategoria:string) => {
        const palavrasMinusculas = ['e', 'de']
    
        return subCategoria
            .toLowerCase()
            .trim()
            .split(' ')
            .map(palavra => {
                if(palavrasMinusculas.includes(palavra)){
                    return palavra
                }else{
                    return palavra.charAt(0).toUpperCase() + palavra.slice(1)
                }
            })
            .join(' ')
    }

    static buscarDataVigenciaProduto = async(codProduto:number, codEmpresa:number):Promise<string> => {
        const dataVigencia:{ DATA_VIGENCIA: string }[]  = await DataSourceOracle
        .createQueryBuilder()
        .select([`
            MAX(TP.TPRC_DTA_VIGENCIA) AS DATA_VIGENCIA
        `])
        .from('PRODUTO', 'P')
        .innerJoin('TAB_PRECO', 'TP', 'TP.TPRC_PROD_EMP_ID = P.PROD_EMP_ID AND TP.TPRC_PROD_ID = P.PROD_ID')
        .where('TP.TPRC_GEN_ID = 15')
        .andWhere('P.PROD_ID = :prodId', {prodId: codProduto})
        .andWhere('P.PROD_EMP_ID = :empresa',{empresa: codEmpresa})
        .andWhere(`TP.TPRC_DTA_VIGENCIA = (
                SELECT 
                    MAX(TP2.TPRC_DTA_VIGENCIA) 
                FROM 
                    TAB_PRECO TP2 
                WHERE TP2.TPRC_GEN_ID = 15
                AND TP2.TPRC_PROD_ID = P.PROD_ID
                AND TP2.TPRC_PROD_EMP_ID = P.PROD_EMP_ID
            )
        `)
        .getRawMany();

        return dataVigencia[0].DATA_VIGENCIA
    }
}



export {ProdutoServico};


