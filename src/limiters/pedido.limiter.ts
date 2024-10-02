import rateLimit from 'express-rate-limit';

// windowMs: Define a janela de tempo para limitar as requisições
// max: limita a quantidade de requisição no intervalo de tempo
// message: A mensagem retornada para o cliente quando o limite é atingido (não usada no momento)
// standardHeaders: true, Inclui cabeçalhos padrão `RateLimit-*, cabeçalho abaixo:`
//      RateLimit-Limit: 100        # Limite requisições por período
//      RateLimit-Remaining: 98     # requisições restantes no período
//      RateLimit-Reset: 900        # O limite será redefinido em 900 segundos (15 minutos)
// legacyHeaders: Desativa os cabeçalhos antigos (X-RateLimit-*).
// handler, método opcional, para costomizar a respsota ao atingir o limite.

const criarPedidoLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 10, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Muitas tentativas de criação de pedido. Tente novamente em 10 minutos.",
        })
    },
});

const enviarComprovanteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
          mensagem: "Muitas tentativas de envio de comprovantes. Tente novamente em 10 minutos."
        });
    },
});

const downloadRelatorioLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Muitas tentativas de download de relatórios. Tente novamente em 15 minutos.",
        })
    },
  });


export {criarPedidoLimiter, enviarComprovanteLimiter, downloadRelatorioLimiter};