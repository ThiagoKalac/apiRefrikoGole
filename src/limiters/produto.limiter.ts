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

const infoProdutoLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
          mensagem: "Muitas requisições para consulta de produto. Tente novamente após 15 minutos.",
      })
    },
  });

const atualizarProdutoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
          mensagem: "Muitas tentativas de atualização de produto. Tente novamente após 15 minutos.",
      })
    },
  });

export {infoProdutoLimiter, atualizarProdutoLimiter};