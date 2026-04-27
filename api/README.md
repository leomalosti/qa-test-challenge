# API Contract Tests

## Visão Geral

Este diretório contém os testes de contrato de API para a aplicação Smart To-Do List. Os testes validam:

- Status codes corretos para cada operação
- Schema de resposta (campos obrigatórios, tipos de dados)
- Casos de borda (payload inválido, ID inexistente, campo ausente)

## Pré-requisitos

1. **Docker** instalado e rodando
2. **Backend** rodando na porta 3001

## Como Rodar os Testes

### 1. Iniciar a aplicação

```bash
# Na raiz do projeto
cd app
docker-compose up --build
```

A API estará disponível em: `http://localhost:3001`

### 2. Instalar dependências

```bash
# Neste diretório (api/)
npm install
```

### 3. Executar os testes

```bash
# Executar todos os testes de API
npm run test

# Ou diretamente com Playwright
npx playwright test
```

### 4. Ver relatório

```bash
npx playwright show-report
```

## Estrutura de Arquivos

```
api/
├── tests/
│   └── api-contract.spec.ts  # Testes de contrato
├── playwright.config.ts      # Configuração do Playwright
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| API_BASE_URL | http://localhost:3001 | URL base da API |

Exemplo:
```bash
API_BASE_URL=http://localhost:3001 npx playwright test
```

## Testes Incluídos

- **POST /tasks** — Criação de tarefas
- **GET /tasks** — Listagem de tarefas
- **PATCH /tasks/:id** — Atualização de tarefas
- **DELETE /tasks/:id** — Exclusão de tarefas
- **POST /ai/generate** — Geração de tarefas com IA
- **Error Handling** — Validação de respostas de erro

## Notas

- Os testes são **determinísticos** — cada teste cria e limpa seu próprio estado
- Os testes usam o **Playwright request context** para chamadas de API diretas
- O relatório HTML é gerado automaticamente em `playwright-report/`