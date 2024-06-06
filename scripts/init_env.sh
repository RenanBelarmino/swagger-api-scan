#!/bin/sh

# Carregar variáveis de ambiente
API_KEY_FILE=${API_KEY_FILE}


MOBSF_SERVICE_NAME=${MOBSF_SERVICE_NAME}
MOBSF_API_PORT=${MOBSF_API_PORT}

# Adicionar outras variáveis de ambiente ao arquivo .env
echo "PORT=3000" >> $API_KEY_FILE
echo "DEFECTDOJO_API_URL=http://localhost:8080/api/v2/products/" >> $API_KEY_FILE
echo "DEFECTDOJO_API_TOKEN=c7ce28b56b64b5366c12bfd03715d4be58c8b61e" >> $API_KEY_FILE
echo "ZAPROXY_URL=http://zaproxy:8080" >> $API_KEY_FILE
echo "ZAP_API_KEY=services_" >> $API_KEY_FILE
echo "MOBSF_URL=http://mobsf:8081" >> $API_KEY_FILE

echo "Arquivo .env gerado com sucesso:"
cat $API_KEY_FILE
