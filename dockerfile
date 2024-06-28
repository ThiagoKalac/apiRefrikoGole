FROM node:20.11.0

# Copie o Oracle Instant Client para o contêiner
COPY ./client-oracle/instantclient_19_22 /opt/oracle/instantclient_19_22

# Instale as dependências necessárias para o Oracle Instant Client
RUN apt-get update && \
    apt-get install -y libaio1 && \
    echo /opt/oracle/instantclient_19_22 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig && \
    ln -s /opt/oracle/instantclient_19_22/libclntsh.so /usr/lib/libclntsh.so && \
    ln -s /opt/oracle/instantclient_19_22/libocci.so /usr/lib/libocci.so

# Verificação das bibliotecas
RUN ls -al /opt/oracle/instantclient_12_2 && \
    echo "LD_LIBRARY_PATH: $LD_LIBRARY_PATH" && \
    echo "PATH: $PATH" && \
    ldconfig -p | grep oracle

# Configure as variáveis de ambiente para o Oracle Instant Client
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_19_22:$LD_LIBRARY_PATH
ENV PATH=/opt/oracle/instantclient_19_22:$PATH
ENV TNS_ADMIN=/opt/oracle/instantclient_19_22/network/admin

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
