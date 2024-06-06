FROM node

# # Instalar dependências necessárias para o Horusec CLI e para o make
RUN apt-get update && apt-get install -y curl jq make

# Definir diretório de trabalho
WORKDIR /app

COPY node_modules /app/node_modules
COPY routes /app/routes
COPY src /app/src
COPY package-lock.json /app/
COPY package.json /app/
COPY index.js /app/
COPY swagger.js /app/
COPY users.js /app/
COPY .env /app/

# Copiar script de instalação do Horusec
COPY scripts/install_horusec.sh /app/scripts/

# # Instalar Horusec CLI
RUN /bin/bash /app/scripts/install_horusec.sh

#COPY . .

# Expor porta da aplicação
EXPOSE 3000

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
