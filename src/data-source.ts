import { createClient } from "@supabase/supabase-js";
import { DataSource } from "typeorm";
import path from "path"
import "dotenv/config"

const DataSourceOracle = new DataSource({
    type: "oracle",
    host: process.env.ORACLE_HOST,
    port: parseInt(process.env.ORACLE_PORT),
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    sid: process.env.ORACLE_DATABASE,
    entities: [
        path.join(__dirname + "/entity/*{.js,.ts}"), 
    ],
    synchronize: true,
    logging: true,
})


// conexão com supabaseAPI
const supabaseUrl = process.env.SUPABASE_URL
const DataSupabase = createClient(supabaseUrl, process.env.SUPABASE_KEY);



export {DataSourceOracle, DataSupabase}