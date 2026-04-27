# E2E Tests - Smart To-Do List

## Visão Geral

Este diretório contém os testes E2E (End-to-End) para a aplicação Smart To-Do List usando **Playwright** com o padrão **Page Object Model (POM)**.

Os testes validam a interface do usuário e os fluxos de interação do usuário com a aplicação.

## Pré-requisitos

1. **Docker** instalado e rodando
2. **Aplicação** rodando (frontend na porta 3000)

## Como Rodar os Testes

### 1. Iniciar a aplicação

```bash
# Na raiz do projeto
cd app
docker-compose up --build
```

A aplicação estará disponível em:
- **Frontend:** http://localhost:3000
- **API (Swagger):** http://localhost:3001/api/docs

### 2. Instalar dependências

```bash
# Neste diretório (e2e/)
npm install
```

### 3. Executar os testes

```bash
# Executar todos os testes de uma vez
npx playwright test

# Executar todos os testes E2E
npm run test:e2e

# Ou diretamente com Playwright
npx playwright test tests/task-creation.spec.ts
npx playwright test tests/task-completion.spec.ts
npx playwright test tests/task-deletion.spec.ts
npx playwright test tests/empty-stage.spec.ts
npx playwright test tests/error-handling.spec.ts

```

### 4. Ver relatório

```bash
npx playwright show-report
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run test:e2e` | Executa todos os testes E2E |
| `npm run test:creation` | Executa testes de criação de tarefas |
| `npm run test:completion` | Executa testes de conclusão de tarefas |
| `npm run test:deletion` | Executa testes de exclusão de tarefas |
| `npm run test:empty` | Executa testes de estado vazio |
| `npm run test:errors` | Executa testes de tratamento de erros |
| `npm run test:ui` | Executa testes com UI do Playwright |
| `npm run test:headed` | Executa testes em modo headed |
| `npm run test:debug` | Executa testes em modo debug |
| `npm run report` | Abre o relatório HTML |

## Estrutura de Arquivos

```
e2e/
├── pages/                    # Page Objects
│   ├── HomePage.ts
│   ├── HeaderPage.ts
│   ├── TaskFormPage.ts
│   ├── TaskListPage.ts
│   └── AiGeneratorPage.ts
├── fixtures/                 # Fixtures
│   └── tasks.fixture.ts
├── tests/                    # Testes
│   ├── task-creation.spec.ts
│   ├── task-completion.spec.ts
│   ├── task-deletion.spec.ts
│   ├── empty-stage.spec.ts
│   └── error-handling.spec.ts
├── playwright.config.ts      # Configuração do Playwright
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| FRONTEND_URL | http://localhost:3000 | URL do frontend |
| API_BASE_URL | http://localhost:3001 | URL da API |

Exemplo:
```bash
FRONTEND_URL=http://localhost:3000 npx playwright test
```

## Fluxos Testados

### Task Creation (task-creation.spec.ts)
- Renderização do formulário de tarefas
- Criação de nova tarefa
- Limpeza do campo após criação
- Atualização do contador no header

### Task Completion (task-completion.spec.ts)
- Renderização do checkbox de conclusão
- Marcar tarefa como concluída
- Persistência após reload da página
- Desconclusão de tarefa

### Task Deletion (task-deletion.spec.ts)
- Renderização do botão de deletar
- Exclusão de tarefa
- Atualização do contador após exclusão
- Remoção correta da lista

### Empty Stage (empty-stage.spec.ts)
- Renderização do header
- Contador inicial como zero
- Estado vazio da lista
- Criação de primeira tarefa

### Error Handling (error-handling.spec.ts)
- Simulação de erro na API (criação)
- Simulação de erro na API (listagem)
- Simulação de erro na API (deleção)
- Componente AI Generator

## Padrões Utilizados

- **Page Object Model (POM):** Separação de lógica de página em classes dedicadas
- **Selectors estáveis:** Uso de `data-testid`, `role` e `aria-label`
- **Testes determinísticos:** Cada teste cria e limpa seu próprio estado
- **Fixtures:** Reutilização de setup entre testes

## Notas

- Os testes são executados em múltiplos navegadores: Chrome, Firefox, Webkit, Mobile Chrome, Mobile Safari
- O relatório HTML é gerado automaticamente em `playwright-report/`
- Screenshots são capturados apenas em falhas