import "reflect-metadata"
import { DataSupabase, DataSourceOracle } from "./data-source"
import { app } from "./app"

(async () => {
    try{
          
        let { data, error } = await DataSupabase // verificando a conexão com supabase
           .from('usuario')  
           .select('nome') 
           .limit(1);

        if (error) {
            throw new Error(`Erro ao conectar com Supabase: ${error.message}`);
        }

        await DataSourceOracle.initialize() // iniciando a conexão com o oracle
        
        app.listen(3000, () => {
            console.log("Servidor executando")
        })    

    } catch(err) {
        console.error("Erro ao iniciar a aplicação:", err)
    }
})()




