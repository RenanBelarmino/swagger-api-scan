FROM node:latest

# Instalar dependências necessárias para o Horusec CLI, para o make e para o Docker
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    make \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Adicionar a chave GPG oficial do Docker
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Configurar o repositório estável do Docker
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io

# Definir diretório de trabalho
WORKDIR /app

# Copiar os arquivos do projeto para o diretório de trabalho
COPY node_modules /app/node_modules
COPY routes /app/routes
COPY src /app/src
COPY package-lock.json /app/
COPY package.json /app/
#COPY concurrentScans.js /app/
#COPY index.js /app/
#COPY auth.js /app/
#COPY swagger.js /app/
#COPY users.js /app/
COPY .env /app/

# Copiar script de instalação do Horusec
COPY scripts/install_horusec.sh /app/scripts/

# Instalar Horusec CLI
RUN /bin/bash /app/scripts/install_horusec.sh

# Definir permissões para o diretório de resultados
#RUN chmod -R 777 /src/data/dast/results
#RUN mkdir -p /zap/wrk/results && chmod -R 777 /zap/wrk/results

# Expor porta da aplicação
EXPOSE 3000

# Comando padrão para iniciar a aplicação
CMD ["node", "routes/index.js"]
