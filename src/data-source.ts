import { createClient } from "@supabase/supabase-js";
import { DataSource } from "typeorm";
import { Funcionarios } from "./entity/Funcionarios";
import "dotenv/config"

const DataSourceOracle = new DataSource({
    type: "oracle",
    host: process.env.ORACLE_HOST,
    port: parseInt(process.env.ORACLE_PORT),
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    sid: process.env.ORACLE_DATABASE,
    synchronize: true,
    logging: ["error"]
})
//path.join(__dirname + "/entity/*{.js,.ts}"), 

// conexão com supabaseAPI
const supabaseUrl = process.env.SUPABASE_URL
const DataSupabase = createClient(supabaseUrl, process.env.SUPABASE_KEY);

//conexão com o supabaseLiquidaApp
const liquidaAppUrl = process.env.SUPABASE_LIQUIDA_APP_URL;
const DataLiquidaApp = createClient(liquidaAppUrl, process.env.SUPABASE_LIQUIDA_APP_KEY);

// conexao postgree
const DataSourcePostGree = new DataSource({
    type: "postgres",
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    synchronize: true,
    logging: ["error"],
    entities: [Funcionarios]
})

export {DataSourceOracle, DataSupabase, DataSourcePostGree, DataLiquidaApp}