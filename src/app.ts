import express from "express";
import 'express-async-errors';
import { usuarioRouter } from "./routes/usuario.route";
import { tratarError } from "./error/tratarError";
import { sessaoRouter } from "./routes/sessao.route";
import { produtoRouter } from "./routes/produto.route";
import { pedidoRouter } from "./routes/pedido.route";
import cors from 'cors';
import { Agenda } from "./jobs/agendaCronJobs";
import { globalLimiter } from "./limiters/global.limiter";


const app = express();

// Configuração do CORS para controlar origens permitidas
const allowedOrigins = ['http://localhost:2000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(globalLimiter);


app.use(express.json());

app.use('/usuario', usuarioRouter);
app.use('', sessaoRouter);
app.use('/produto',produtoRouter);
app.use('/pedido',pedidoRouter);
app.use(tratarError);


Agenda.iniciarTarefas()

export {app};