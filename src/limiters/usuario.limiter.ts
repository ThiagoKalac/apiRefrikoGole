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

const infoUsuarioLimiter  = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minuto
    max: 100,
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Você atingiu o limite de requisições para buscar informações, tente novamente em 1 minuto",
        })
    }, 
})

const cadastroLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Muitas tentativas de cadastro. Tente novamente após 10 minutos.",
        })
    },
});

const recuperacaoSenhaLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Muitas tentativas de recuperação de senha. Tente novamente após 15 minutos.",
        })
    },
});

const notificarUsuarioLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 2, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            mensagem: "Muitas tentativas de notificação. Tente novamente após 5 minutos.",
        })
    },
});

export {infoUsuarioLimiter, cadastroLimiter, recuperacaoSenhaLimiter, notificarUsuarioLimiter};