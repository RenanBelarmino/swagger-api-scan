# API de Scan Services

Este projeto fornece uma API para serviços de scan DAST (Dynamic Application Security Testing) e SAST (Static Application Security Testing) com autenticação baseada em JWT (JSON Web Token).

## Índice

- [Instalação](#instalação)
- [Uso](#uso)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Login](#login)
  - [SAST Scan](#sast-scan)
- [Documentação Swagger](#documentação-swagger)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Logs](#logs)

## Instalação

Para rodar o projeto localmente, siga os passos abaixo:

1. Clone o repositório:

    ```bash
    git clone <url-do-repositório>
    cd <nome-do-repositório>
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

    ```env
    JWT_SECRET=your_jwt_secret
    ```

4. Inicie o servidor:

    ```bash
    npm start
    ```

## Uso

Para utilizar a API, você pode usar ferramentas como `Postman`, `curl`, ou acessar a documentação gerada pelo Swagger.

### Autenticação

Todas as requisições aos endpoints de scan devem incluir um token JWT no cabeçalho da requisição. Primeiro, obtenha um token usando o endpoint de login.

## Endpoints

### Login

#### URL

`POST /api/login`

#### Parâmetros

| Campo     | Tipo   | Descrição              |
|-----------|--------|------------------------|
| `username`| string | Nome do usuário        |
| `password`| string | Senha do usuário       |

#### Exemplo de Requisição

```bash
curl -X POST http://localhost:3000/api/login \
-H "Content-Type: application/json" \
-d '{"username":"renan","password":"renan123"}'


### SAST Scan

#### URL

`POST /api/sast/scan`

#### Descrição

Este endpoint inicia um scan SAST fornecendo um arquivo ou pasta para análise. Suporta múltiplos formatos de arquivo, incluindo `.zip`, `.tar`, `.tar.gz`, `.tgz`, `.gz`, e `.bz2`.

#### Parâmetros

| Campo     | Tipo     | Descrição                           |
|-----------|----------|-------------------------------------|
| `project` | file     | Arquivo ou pasta a ser analisado    |

#### Cabeçalho

| Campo           | Tipo   | Descrição                       |
|-----------------|--------|---------------------------------|
| `Authorization` | string | Bearer token JWT obtido no login|

#### Exemplo de Requisição

```bash
curl -X POST http://localhost:3000/api/sast/scan \
-H "Authorization: Bearer <seu-token-aqui>" \
-F "project=@/caminho/para/o/seu/arquivo.zip"

{
  "message": "Scan Realizado com sucesso",
  "scanId": "abcdef123456"
}


http://localhost:3000/api-docs


.
├── src/
│   ├── data/
│   │   ├── sast/
│   │   │   ├── uploads/        # Diretório para uploads de arquivos
│   │   │   └── results/        # Diretório para resultados de scans
│   └── routes/
│       ├── dast/
│       │   ├── d.POST_Scan.js  # Rota para POST Scan DAST
│       │   └── d.GET_SCAN_ID.js# Rota para GET Scan ID DAST
│       ├── sast/
│       │   ├── s.POST_Scan.js  # Rota para POST Scan SAST
│       │   ├── s.POST_Scan_GIT.js# Rota para POST Scan GIT SAST
│       │   └── s.GET_SCAN_ID.js# Rota para GET Scan ID SAST
│       └── login.js            # Rota para login
├── auth.js                      # Módulo de autenticação
├── swagger.js                   # Configuração do Swagger
├── index.js                     # Ponto de entrada da aplicação
├── users.js                     # Base de dados de usuários (temporária)
├── package.json
└── README.md                    # Documentação do projeto

Logs
Para facilitar o debug e monitoramento, logs são gerados durante os processos de autenticação e execução de scans. Eles estão no formato:


