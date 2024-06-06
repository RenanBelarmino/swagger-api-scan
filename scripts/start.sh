#!/bin/bash

# Script para iniciar o Docker Compose, subir o Node.js e instalar as dependências

# Verifica se o Docker Compose está instalado
docker_compose_installed=$(command -v docker-compose)

if [ -z "$docker_compose_installed" ]; then
  echo "Docker Compose não está instalado. Por favor, instale o Docker Compose e tente novamente."
  exit 1
fi

# Inicia o Docker Compose
echo "Iniciando Docker Compose..."
docker-compose up -d

# Verifica se o Node.js está instalado
node_installed=$(command -v node)

if [ -z "$node_installed" ]; then
  echo "Node.js não está instalado. Por favor, instale o Node.js e tente novamente."
  exit 1
fi

# Verifica se o arquivo package.json existe
if [ -f "package.json" ]; then
  # Instala as dependências do Node.js
  echo "Instalando as dependências do Node.js..."
  npm install
fi

# Inicia o Node.js
echo "Iniciando o Node.js..."
npm start

# Fim do script
echo "Script concluído."





docker run --rm -v $(pwd):/src/horusec horuszup/horusec-cli:latest horusec start -p /src/horusec -P $(pwd) --config-file-path=/src/horusec/horusec-config.json
docker run --rm-v $(pwd):/src horuszup/horusec-cli:latest horusec start -p /src -P $(pwd) --config-file-path=/src/horusec/horusec-config.json
docker run --rm -v $(pwd):/src/horusec horuszup/horusec-cli:latest horusec start -p /src/horusec -P $(pwd) --config-file-path=/src/horusec/horusec-config.json
docker run -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd):/src/horusec horuszup/horusec-cli:latest horusec start -p /src/horusec -P $(pwd)

horusec start -p . --disable-docker="true" --information-severity=true --json-output-file results.txt

docker run -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd):/src/horusec horuszup/horusec-cli:latest horusec start -p . --disable-docker="true" --information-severity=true --json-output-file results.txt