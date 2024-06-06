#!/bin/bash

set -e

# Verificar se o sistema é Linux
if [[ $(uname -s) != "Linux" ]]; then
    echo "SAST CLI installation is only supported on Linux"
    exit 1
fi

# Determinar a arquitetura do sistema
ARCH=$(uname -m)
if [[ "$ARCH" != "x86_64" ]]; then
    echo "SAST CLI installation is only supported on x86_64 architecture"
    exit 1
fi

# Determinar a última versão do Horusec
VERSION="latest"

# Baixar e instalar o Horusec CLI
URL="https://github.com/ZupIT/horusec/releases/latest/download/horusec_linux_amd64"
INSTALL_DIR="/usr/local/bin"
INSTALL_PATH="$INSTALL_DIR/horusec"

echo "Instalando Serviço SAST CLI..."
curl -fsSL -o "$INSTALL_PATH" "$URL"

echo "CLI was downloaded and moved to $INSTALL_PATH"

# Dar permissão de execução ao Horusec CLI
chmod +x "$INSTALL_PATH"

echo "SAST installation completed successfully"
