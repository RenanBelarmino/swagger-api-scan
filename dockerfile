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

# Copiar arquivos package.json e package-lock.json antes de instalar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Instalar bcrypt separadamente
RUN npm install bcrypt

# Copiar script de instalação do Horusec
COPY scripts/install_horusec.sh /app/scripts/

# Instalar Horusec CLI
RUN /bin/bash /app/scripts/install_horusec.sh

# Expor porta da aplicação
EXPOSE 3000

# Comando padrão para iniciar a aplicação
CMD ["node", "index.js"]
