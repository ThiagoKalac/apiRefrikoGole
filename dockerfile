# Use a imagem oficial do Node.js como imagem base
FROM node:14

# Defina o diretório de trabalho da aplicação
WORKDIR /usr/src/app

# Copie os arquivos package.json e yarn.lock para o diretório de trabalho
COPY package.json yarn.lock ./

# Instale as dependências da aplicação
RUN yarn install

# Copie todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Instale o Oracle Instant Client
RUN apt-get update && \
    apt-get install -y libaio1 wget unzip && \
    wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip && \
    unzip instantclient-basic-linux.x64-19.8.0.0.0dbru.zip && \
    mv instantclient_19_8 /usr/lib/oracle/19.8/client64 && \
    rm instantclient-basic-linux.x64-19.8.0.0.0dbru.zip && \
    echo /usr/lib/oracle/19.8/client64 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Exponha a porta que a aplicação usará
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"]
