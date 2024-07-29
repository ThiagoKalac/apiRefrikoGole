import { AppError } from "../error/appError";


class FormatadorDeData {
    static formatarData(data: Date, formato: string): string {
        const map = {
            mm: ('0' + (data.getMonth() + 1)).slice(-2),
            dd: ('0' + data.getDate()).slice(-2),
            aa: data.getFullYear().toString().slice(-2),
            aaaa: data.getFullYear(),
            HH: ('0' + data.getHours()).slice(-2),
            MM: ('0' + data.getMinutes()).slice(-2),
            SS: ('0' + data.getSeconds()).slice(-2),
            SSS: ('00' + data.getMilliseconds()).slice(-3),
            SSSSSS: ('000000' + (data.getMilliseconds() * 1000)).slice(-6)
        };

        return formato.replace(/aaaa|aa|mm|dd|HH|MM|SS|SSS/gi, matched => map[matched]);
    }

    static converterData(data: string | Date, bancoDeDados: 'oracle' | 'supabase', tipoConversao: string|null = null): string {
        
        let novaData = this.converterDataParaPadraoJs(data as string);
  
        if (bancoDeDados === 'oracle') {
            return this.formatarData(novaData, 'dd/mm/aaaa');
        } else if (bancoDeDados === 'supabase') {
            // Ajuste as horas conforme o tipo de conversão
            if (tipoConversao === 'inicio') {
                novaData.setHours(0, 0, 0, 0); // 00:00:00
            } else if (tipoConversao === 'fim') {
                novaData.setHours(13, 0, 0, 0); // 13:00:00
            }
            // return this.formatarData(novaData, 'aaaa-mm-dd HH:MM:SS.SSSSSS+00');
            return novaData.toISOString()
            
        } else {
            throw new AppError(`Banco de dados ${bancoDeDados} não suportado`,404);
        }
    }

   
    static converterDataParaPadraoJs(dateStr) {
        const regex = /(\d{2})[-\/](\d{2})[-\/](\d{4})|(\d{4})[-\/](\d{2})[-\/](\d{2})/;
        const match = dateStr.match(regex);

        if (match) {
            let year, month, day;

            if (match[4] && match[5] && match[6]) {
                // Formato yyyy-mm-dd ou yyyy/mm/dd
                year = match[4];
                month = match[5];
                day = match[6];
            } else if (match[1] && match[2] && match[3]) {
                // Formato dd-mm-yyyy ou dd/mm/yyyy
                day = match[1];
                month = match[2];
                year = match[3];
            } else {
                throw new Error('Formato de data inválido');
            }
            
            return new Date(year, month - 1, day);
        } else {
            throw new Error('Formato de data inválido');
        }
    }

    static subtrairUmDia(data:string):string {
        let novaData = new Date(data); 
        novaData.setDate(novaData.getDate() - 1);
        return novaData.toISOString();
    }

};





export {FormatadorDeData};