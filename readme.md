# API de Scan Services

Este projeto fornece uma API para serviços de scan DAST (Dynamic Application Security Testing) e SAST (Static Application Security Testing) com autenticação baseada em JWT (JSON Web Token).

## Índice

- [Instalação](#instalação)
- [Uso](#uso)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Login](#login)
  - [SAST](#SAST)
    - [SAST Scan](#sast-scan)
    - [SAST GET](#sast-GET)
- [Documentação Swagger](#documentação-swagger)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Routes](#routes)

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
```

### SAST Scan POST

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
```

##### SAST
Teste de Segurança Estática (SAST)
O Teste de Segurança Estática (Static Application Security Testing - SAST) é uma técnica utilizada para identificar potenciais vulnerabilidades de segurança no código-fonte de uma aplicação sem a necessidade de executá-la. Essa abordagem permite detectar falhas de segurança em um estágio inicial do ciclo de desenvolvimento, ajudando a mitigar riscos antes que o software seja implantado em produção.

Funcionamento
O processo de SAST envolve a análise estática do código-fonte em busca de padrões de programação e práticas inseguras que possam resultar em vulnerabilidades. As ferramentas de SAST examinam o código sem executá-lo, utilizando técnicas como análise léxica, análise sintática e análise semântica para identificar problemas potenciais.

Linguagens Suportadas
As ferramentas de SAST são projetadas para suportar várias linguagens de programação comuns. Algumas das linguagens frequentemente suportadas incluem:

Python
Ruby
Javascript/Typescript
GoLang
C#
Java
Kotlin
Kubernetes
Terraform
Leaks
Leaks (busca opcional no histórico do Git)
PHP
C/C++
HTML
JSON
Dart
Shell Script
Elixir
Benefícios
Identificação Prévia de Vulnerabilidades: Detecta problemas de segurança no código antes da execução da aplicação.
Integração ao Ciclo de Desenvolvimento: Facilita a correção de vulnerabilidades durante o desenvolvimento, reduzindo custos e tempo.
Melhoria Contínua da Segurança: Ajuda a estabelecer práticas seguras de programação e a manter um código mais resiliente.
Considerações
Configuração Personalizada: As ferramentas de SAST podem ser configuradas para ajustar o nível de severidade das vulnerabilidades detectadas e para personalizar os padrões de análise.
Integração com Fluxos de CI/CD: Podem ser integradas aos pipelines de CI/CD para automação e execução contínua dos testes de segurança.
Conclusão
O SAST desempenha um papel crucial na garantia da segurança do software, ajudando as equipes de desenvolvimento a identificar e corrigir vulnerabilidades desde o início do processo de desenvolvimento. Incorporar ferramentas de SAST no ciclo de vida do desenvolvimento de software é fundamental para fortalecer a postura de segurança de uma organização.

#### SAST GET


Obtém os resultados de um scan pelo ID.

- **Descrição**: Retorna os resultados de um scan do SAST com base no ID gerado.
- **Parâmetros de URL**:
  - `id` (string): ID único do scan gerado pelo SAST.
- **Segurança**: Requer autenticação Bearer Token.
- **Respostas**:
  - **200 OK**:
    - Resultados do scan obtidos com sucesso.
    - Retorna um objeto `result` com os resultados do scan.
  - **404 Not Found**:
    - Scan não encontrado.
    - Retorna uma mensagem de erro indicando que o resultado não foi encontrado.
  - **500 Internal Server Error**:
    - Erro ao obter os resultados do scan.
    - Retorna uma mensagem de erro genérica em caso de falha ao acessar ou processar os resultados.
- **Exemplo de Chamada**:
  - Exemplo de chamada usando Curl:
    ```bash
    curl -X GET "http://localhost:3000/api/resultSAST/{id}"
    ```


### routes

Rota POST /api/login: Define uma rota POST para /api/login. Quando um cliente faz uma requisição POST para esta rota, o código dentro da função de callback é executado.

Middleware router.post(...): Configura o middleware para lidar com requisições POST para /api/login. Dentro da função de callback:

Extração de Dados: Extrai os campos username e password do corpo da requisição usando req.body.

Autenticação: Chama a função authenticateUser(username, password) para verificar se as credenciais são válidas. Se forem válidas, a função retorna o objeto do usuário; caso contrário, retorna null.

Geração do Token: Se o usuário for autenticado com sucesso, a função generateToken(user.username) é chamada para gerar um token JWT com base no nome de usuário do usuário autenticado.

Resposta da API: Se a autenticação for bem-sucedida, a API responde com um status 200 OK e retorna um objeto JSON contendo o token gerado. Se as credenciais forem inválidas, a API responde com um status 401 Unauthorized e envia uma mensagem de texto "Invalid credentials".

#### estrutura-de-pastas

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


### Logs
```
[CONSOLE] - Mensagem do log

Para facilitar o debug e monitoramento, logs são gerados durante os processos de autenticação e execução de scans. Eles estão no formato:

Certifique-se de substituir `<url-do-repositório>` pelo URL real do seu repositório e `<seu-token-aqui>` pelo token JWT gerado na etapa de login. Este `README.md` deve fornecer todas as informações necessárias para instalação, uso, autenticação, acesso aos endpoints, documentação do Swagger, estrutura de pastas e logs do seu projeto.
```

