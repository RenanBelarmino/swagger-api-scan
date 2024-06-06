# Script para baixar e instalar o Docker Compose, iniciar o Docker Compose, subir o Node.js e instalar as dependências

# Baixa e instala o Docker Compose
Write-Host "Baixando o Docker Compose..."
Invoke-WebRequest -Uri "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Windows-x86_64.exe" -OutFile "docker-compose.exe"

# Solicita as credenciais de administrador para instalar o Docker Compose
Write-Host "Forneça as credenciais de administrador para instalar o Docker Compose."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"Move-Item -Path '.\docker-compose.exe' -Destination 'C:\Windows\System32\' -Force`"" -Verb RunAs

# Inicia o Docker Compose
Write-Host "Iniciando Docker Compose..."
docker-compose up -d

# Verifica se o Node.js está instalado e acessível no PATH do sistema
function Test-NodeInstallation {
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        Write-Host "Node.js está instalado em: $($nodePath.Source)"
    } else {
        Write-Host "Node.js não está instalado ou não está acessível no PATH do sistema"
    }
}

# Chama a função para testar a instalação do Node.js
Test-NodeInstallation

# Verifica se o Node.js está instalado
$nodeInstalled = Test-Path "C:\nodejs"

if (-not $nodeInstalled) {
    Write-Host "Node.js não está instalado. Por favor, instale o Node.js e tente novamente."
    Exit 1
}



# Verifica se o arquivo package.json existe
if (Test-Path -Path "package.json") {
  # Instala as dependências do Node.js
  Write-Host "Instalando as dependências do Node.js..."
  npm install
}

# Inicia o Node.js
Write-Host "Iniciando o Node.js..."
npm start

# Fim do script
Write-Host "Script concluído."
