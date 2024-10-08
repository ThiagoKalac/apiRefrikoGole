# apiRefrikoGole

Este projeto é uma API para o sistema de pedidos internos da Refriko, permitindo o controle de pedidos, cadastro de novos usuários que sejam colaboradores da empresa. Controle da faturamento respeitando as regras internas da emrpesa e integração com o banco de dados ERP da empresa, banco de dados do RH para controle de funcionarios e o supabase para controle  do app.

## Estrutura do Projeto

O projeto é organizado nas seguintes pastas principais:

- **src/controllers**: Controladores que manipulam as requisições e respostas HTTP.
- **src/routes**: Define as rotas e as URLs disponíveis para a API.
- **src/services**: Serviços que contêm a lógica de negócio.
- **src/middlewares**: Middlewares para tratamento de autenticação, validação, e erros.
- **src/utils**: Funções utilitárias para a aplicação.
- **src/jobs**: Classe de agendamento e execução de tarefas em segundo plano.

## Principais Tecnologias Utilizadas
- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para construção de APIs RESTful.
- **Supabase**: Utilizado como banco de dados e autenticação.
- **node-cron**: Lib para relaizar as cron jobs, tarefas agendadas.
- **exceljs**: Para criar arquivo excel.

## Instalação

### Pré-requisitos
- Node.js instalado.
- Yarn ou npm como gerenciador de pacotes.
- Configuração do bancos de dadoo, **oracle**, **postgree**, **supabase**.

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/ThiagoKalac/apiRefrikoGole.git
    ```

2. Instale as dependências:

   ```bash
   yarn install
    ```
3. Crie um arquivo .env na raiz do projeto com as seguintes variáveis/credenciais:

  - **oracle**: passar as credenciais do oracle no arquivo .env (seguir o modo delo de exemplo) 
  - **postgree**: passar as credenciais do postgree no arquivo .env (seguir o modo delo de exemplo) 
  - **supabase**: passar as credenciais do oracle no arquivo .env (seguir o modo delo de exemplo) 

4. Inicie o servidor em modo de desenvolvimento:

    ```bash
        yarn dev
    ```

## Documentação 

Documentação completa pode acessar nesse link aqui: 

Na pasta docs, pode ter acesso as imagens dos diagramas:
 - Geral do app.
 - Front-end, fluxo do funcionamento do app.
 - Back-end, das tabelas e seus relacionamentos.



## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.


## Licença
Este projeto está licenciado sob a licença MIT.




[Sobre a Refriko](https://rfk.ind.br/)

