# Use a imagem oficial do Node.js como imagem base
FROM node:20.11.0

# Copie o Oracle Instant Client para o contêiner
COPY ./client-oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip /tmp/

# Instale as dependências necessárias para o Oracle Instant Client
RUN apt-get update && \
    apt-get install -y libaio1 unzip && \
    unzip /tmp/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /opt/oracle && \
    rm -f /tmp/instantclient-basic-linux.x64-12.2.0.1.0.zip && \
    echo /opt/oracle/instantclient_12_2 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Configure as variáveis de ambiente para o Oracle Instant Client
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_12_2:$LD_LIBRARY_PATH
ENV PATH=/opt/oracle/instantclient_12_2:$PATH


# Defina o diretório de trabalho da aplicação
WORKDIR /app

# Copie os arquivos package.json e yarn.lock para o diretório de trabalho
COPY package.json yarn.lock ./

# Instale as dependências da aplicação
RUN yarn install && yarn build


# Copie todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que a aplicação usará
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"]
