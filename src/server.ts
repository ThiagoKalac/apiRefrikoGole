import "reflect-metadata"
import { DataSupabase, DataSourceOracle, DataSourcePostGree } from "./data-source"
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
    } catch(err) {
        console.error("Erro ao iniciar a aplicação:", err)
    }

    try{
        await DataSourceOracle.initialize() // iniciando a conexão com o oracle
       
    }catch(error){
        console.error("Erro ao iniciar conexão com o oracle:", error)
    }

    try{
        await DataSourcePostGree.initialize()

        app.listen(3000, () => {
            console.log("Servidor executando")
        }) 

    }catch(error){
        console.error("Erro ao iniciar conexão com o postgree:", error)
    }
      
})()




