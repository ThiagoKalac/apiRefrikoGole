import { AppError } from "../error/appError";

class FormatadorDeData {
    static formatarData(data: Date, formato: string): string {
        const map = {
            mm: ('0' + (data.getMonth() + 1)).slice(-2),
            dd: ('0' + data.getDate()).slice(-2),
            aa: data.getFullYear().toString().slice(-2),
            aaaa: data.getFullYear(),
            hh: ('0' + data.getHours()).slice(-2),
            mi: ('0' + data.getMinutes()).slice(-2),
            ss: ('0' + data.getSeconds()).slice(-2),
        };

        return formato.replace(/aaaa|aa|mm|dd|hh|mi|ss/gi, matched => map[matched]);
    }

    static converterData(data: string | Date, bancoDeDados: 'oracle' | 'supabase', tipoConversao: string): string {
        
        const novaData = new Date(data);
        
        if (!novaData) {
            throw new AppError(`Data do período ${tipoConversao} fornecida é inválida`);
        }

        if (bancoDeDados === 'oracle') {
            return this.formatarData(novaData, 'dd/mm/aaaa');
        } else if (bancoDeDados === 'supabase') {
            return novaData.toISOString(); // Formato ISO 8601 com fuso horário
        } else {
            throw new AppError(`Banco de dados ${bancoDeDados} não suportado`);
        }
    }

};

export {FormatadorDeData};