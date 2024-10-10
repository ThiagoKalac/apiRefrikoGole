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
import { AppError } from "./error/appError";


const app = express();

// Configura o trust proxy para aceitar o X-Forwarded-For e identificar o IP real do cliente, aceitando a primeira camada
app.set('trust proxy', 1);

// Configuração do CORS para controlar origens permitidas
const allowedOrigins = ['http://localhost:2000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Origem não permitida pelo CORS',403));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(globalLimiter);


app.use(express.json());

app.use('/api/v1/rfk/usuario', usuarioRouter);
app.use('/api/v1/rfk/sessao', sessaoRouter);
app.use('/api/v1/rfk/item',produtoRouter);
app.use('/api/v1/rfk/pedido',pedidoRouter);
app.use(tratarError);


Agenda.iniciarTarefas()

export {app};