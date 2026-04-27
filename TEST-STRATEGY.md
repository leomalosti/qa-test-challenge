# TEST-STRATEGY — Estratégia de Qualidade para Smart To-Do List

**Autor:** QA Engineer — Sinky  
**Data:** 24 de abril de 2026  
**Versão:** 1.0

---

## 1. Análise de Risco

### 1.1 Mapa de Risco por Funcionalidade

Com base na análise do PRD e na aplicação, estas funcionalidades representam o maior risco para o negócio:

#### 🔴 RISCO CRÍTICO

##### RF-05 — Geração de Tarefas por IA (Risco: **MUITO ALTO**)

**Por quê:**
- É a funcionalidade diferenciadora da Sinky — o principal valor agregado
- Depende de um serviço externo (OpenRouter) que está **fora do nosso controle**
- Qualidade de resultado afeta diretamente a métrica de negócio: "40% dos usuários ativos adotando a feature"
- Falhas silenciosas aqui levam ao abandono (persona Marina tem baixa tolerância a erros)
- **16 problemas críticos identificados** no PRD-REVIEW relacionados a este requisito (PRD-001, PRD-002, PRD-005, PRD-006, PRD-008)

**Cenários críticos a testar:**
1. **API Key inválida/expirada:** Sistema deve detectar e comunicar claramente
2. **Timeout da IA:** Usuário pode ficar esperando indefinidamente
3. **Resposta malformada:** Parsing pode quebrar silenciosamente
4. **Rate limiting:** Sistema precisa proteger contra abuso e custos descontrolados
5. **Segurança da chave:** XSS ou localStorage com key exposto é desastre total

**Impacto de falha:**
- Usuários não conseguem usar a feature principal
- Abandono da plataforma (conforme métricas de sucesso do PRD: "Redução de fricção")
- Custos incontrolados se houver abuso
- Perda de confiança (credenciais de terceiros vazadas)

---

##### RF-03 + RF-04 — Gestão de Estado de Tarefas (Risco: **MUITO ALTO**)

**Por quê:**
- Estado é o core da aplicação — tarefas concluídas/deletadas é o valor principal entregue
- Alterações de estado devem **persistir** — isso não é opcional
- Sem sincronização correta, o usuário não confia na plataforma
- Sem confirmação de exclusão, risco de perda de dados (persona Marina: "não volta se falhar")

**Cenários críticos a testar:**
1. **Persistência:** Recarregar página → dados devem estar lá
2. **Confirmação de exclusão:** Não deve haver exclusão acidental
3. **Estado intermediário:** O que acontece se o servidor falha durante a mudança?
4. **Concorrência:** Se múltiplos clientes tentam modificar a mesma tarefa?
5. **Feedback visual:** Usuário sempre sabe se a ação funcionou

**Impacto de falha:**
- Perda de dados → abandono imediato
- Comportamento imprevisível → reduz confiança
- Suporte aumenta (usuários reclamando de "bugs")

---

##### RF-06 — Configuração de API Key (Risco: **MUITO ALTO**)

**Por quê:**
- Envolve **credenciais de terceiros** — tem implicações legais e de segurança
- Se chave for vazada, o Sinky é responsabilizado
- Sem proteção adequada, qualquer atacante pode usar a chave do usuário (custos incontrolados)
- **PRD-001 identificou: armazenamento provavelmente inseguro em localStorage**

**Cenários críticos a testar:**
1. **XSS:** Atacante injeta código → consegue acessar `localStorage.getItem('apiKey')`?
2. **Network inspection:** DevTools → consegue ver a chave em requisições?
3. **Memory:** Chave fica em memória de forma acessível?
4. **Criptografia:** Se armazenada, está encriptada?

**Impacto de falha:**
- Vazamento de credenciais de usuário → responsabilidade legal
- Custos fraudulentos → ação legal, perda de confiança
- Reputação danificada

---

#### 🟠 RISCO ALTO

##### RF-01 — Listagem de Tarefas (Risco: **ALTO**)

**Por quê:**
- É o endpoint mais usado — qualquer falha afeta diretamente a UX
- Empty state não especificado → novo usuário pode se perder
- Diferenciação visual de tarefas geradas vs. manuais é vaga → pode quebrar durante desenvolvimento

**Cenários críticos:**
1. **Performance:** Com 1000 tarefas, a listagem fica lenta?
2. **Empty state:** Novo usuário sabe o que fazer?
3. **Identificação visual:** Consegue diferenciar tarefa gerada vs. manual?
4. **Carregamento:** Estado inconsistente durante carregamento?

**Impacto:** Afeta métrica "redução de 20% no tempo entre login e 1ª tarefa"

---

##### RF-02 — Criação Manual de Tarefa (Risco: **ALTO**)

**Por quê:**
- Validação de entrada não especificada (PRD-004)
- Segurança: caracteres especiais não escapados podem levar a XSS
- UX: sem feedback, usuário não sabe se erro ocorreu

**Cenários críticos:**
1. **Injeção XSS:** `<script>alert('xss')</script>` como título → o que acontece?
2. **Limite de caracteres:** Título com 1000 caracteres → quebra layout?
3. **Campos vazios:** Espaços em branco como título?
4. **Caracteres especiais:** Emojis, acentos, símbolos → salvam corretamente?

**Impacto:** Corrompe dados, abre vetor de segurança

---

#### 🟡 RISCO MÉDIO

##### Requisitos Não-Funcionais (RNF) (Risco: **MÉDIO**)

- **Compatibilidade:** PRD-011 — PRD diz Chrome/Firefox, mas personas usam Safari. Qual é a realidade?
- **Responsividade:** PRD-012 — 375px é muito restritivo. Qual o breakpoint mínimo realista?
- **Acessibilidade:** PRD-014 — Sem requisitos, nenhum teste de acessibilidade será feito. Exclusão de usuários com deficiência.

---

### 1.2 Matriz de Risco

| Funcionalidade | Probabilidade | Impacto | Prioridade | Status |
|---|---|---|---|---|
| RF-05 (Geração IA) | ALTA | CRÍTICO | P0 | **BLOQUEADOR** |
| RF-06 (API Key) | ALTA | CRÍTICO | P0 | **BLOQUEADOR** |
| RF-03/RF-04 (Estado) | MÉDIA | CRÍTICO | P0 | **BLOQUEADOR** |
| RF-01 (Listagem) | MÉDIA | ALTA | P1 | Crítico |
| RF-02 (Criação) | MÉDIA | ALTA | P1 | Crítico |
| RNF (Acessibilidade) | BAIXA | MÉDIA | P2 | Importante |
| RNF (Compatibilidade) | MÉDIA | MÉDIA | P2 | Importante |

---

## 2. Pirâmide de Testes

```
                    ▲
                   ╱ ╲
                  ╱   ╲
                 ╱ E2E ╲           30% — Testes de interface (Playwright)
                ╱       ╲          Fluxos críticos de usuário
               ╱---------╲
              ╱           ╲
             ╱ Integração  ╲       40% — Testes de API, backend, e contrato
            ╱  + Contrato   ╲      Camada de negócio + validação de schema
           ╱-----------------╲
          ╱                   ╲
         ╱     Unitários       ╲   30% — Testes de componentes isolados
        ╱                       ╲  Utilities, DTOs, parsing, validação
       ╱_________________________╲
```

### 2.1 Camada 1: Testes Unitários (30%)

**Foco:** Lógica isolada, sem dependências externas

**O que testar:**

1. **Parsing da resposta da IA (RF-05)**
   ```typescript
   // parseAiResponse.ts
   - Entrada: string com 1, 5, 20, 21 tarefas
   - Saída: array de tarefas parseadas
   - Edge cases: resposta vazia, malformada, com caracteres especiais
   ```
   **Importância:** CRÍTICA — múltiplas falhas podem acontecer aqui

2. **Validação de entrada (RF-02, RF-05)**
   ```typescript
   // validators.ts
   - validateTaskTitle(title: string): boolean
   - validateAiPrompt(prompt: string): boolean
   - Limites: min/max caracteres, espaços em branco, caracteres especiais
   ```
   **Importância:** ALTA — previne injeção XSS e dados ruins

3. **DTOs e tipos**
   ```typescript
   // DTOs
   - CreateTaskDto: validação de schema
   - GenerateTasksDto: validação de prompt
   - ApiKeyDto: validação de formato
   ```

4. **Formatação e escape**
   ```typescript
   // sanitize.ts
   - escapeHtml(text: string): string
   - removeHtmlTags(text: string): string
   ```
   **Importância:** CRÍTICA — previne XSS

**Ferramenta:** Jest ou Vitest (já incluído em NestJS)

**Cobertura esperada:** 80%+ de cobertura

---

### 2.2 Camada 2: Testes de Integração (40%)

**Foco:** Interação entre camadas (Controller → Service → Repository), sem frontend

**O que testar:**

1. **Fluxo de criação de tarefa (RF-02)**
   ```typescript
   // tasks.service.spec.ts
   POST /tasks
   - Sucesso: 201 + tarefa retornada
   - Validação falha: 400 + mensagem
   - Erro de BD: 500
   - Título vazio: 400
   - Título > 500 caracteres: 400
   - Caracteres especiais: 201 + escapados
   ```

2. **Fluxo de mudança de estado (RF-03)**
   ```typescript
   // tasks.service.spec.ts
   PATCH /tasks/:id
   - Sucesso: 200 + tarefa marcada
   - ID inválido: 404
   - Recarregar: estado persiste em BD
   ```

3. **Fluxo de exclusão (RF-04)**
   ```typescript
   // tasks.service.spec.ts
   DELETE /tasks/:id
   - Sucesso: 204
   - ID inválido: 404
   - Recarregar: tarefa não existe
   - Sem confirmação backend: exclusão ocorre (backend não valida, frontend valida)
   ```

4. **Fluxo de geração por IA (RF-05) — MOCK externo**
   ```typescript
   // ai.service.spec.ts
   POST /ai/generate
   - Mock OpenRouter com resposta válida: 201 + tarefas geradas
   - Mock OpenRouter com timeout: 504
   - Mock OpenRouter com API Key inválida: 401
   - Mock OpenRouter com resposta malformada: 400
   - Mock com > 20 tarefas: 201 + 20 tarefas + warning
   - Mock com 0 tarefas: 400
   ```
   **Importância:** CRÍTICA — principal vetor de falha

5. **Rota de API Key (RF-06) — Segurança**
   ```typescript
   // api-key.controller.spec.ts
   POST /config/api-key
   - Salvar chave: 200 (deve estar encriptada em BD, não em localStorage)
   - GET /config/api-key: 200 (nunca retorna a chave em plaintext)
   - Chave vazia: 400
   - Chave inválida: 400 (idealmente validar contra OpenRouter)
   ```

6. **Listagem com persistência (RF-01)**
   ```typescript
   // tasks.service.spec.ts
   GET /tasks
   - Vazio: 200 + []
   - Com tarefas: 200 + todas as tarefas com os campos corretos
   - Incluir indicador "generated_by_ai": true/false
   ```

7. **Validação de Contrato de API (Schema e Status Codes)**
   
   **Importância:** ALTA — garante compatibilidade com frontend e clientes futuros
   
   **O que testar:**
   ```typescript
   // api-contract.spec.ts — Usando Playwright request context
   
   // POST /tasks — Criar tarefa
   - Status: 201
   - Response body: { id: UUID, title: string, completed: false, generated_by_ai: false }
   - Tipos: id e title devem ser string
   - Campo generated_by_ai sempre false para criação manual
   
   // GET /tasks — Listar tarefas
   - Status: 200
   - Response body: Array de tasks
   - Cada task: { id, title, completed, generated_by_ai }
   - Array vazio quando não há tarefas
   
   // PATCH /tasks/:id — Atualizar status
   - Status: 200
   - Response body: { ...task, completed: boolean }
   - ID inválido: 404 Not Found
   
   // DELETE /tasks/:id — Deletar tarefa
   - Status: 204 No Content
   - Sem corpo de resposta
   - ID inválido: 404 Not Found
   
   // POST /ai/generate — Gerar tarefas com IA
   - Status: 201 (sucesso) ou 400/401/504 (erro)
   - Success response: { tasks: string[], warning?: string }
   - Error response: { error: string, details?: string }
   - API Key inválida: 401 Unauthorized
   - Parsing falha: 400 Bad Request
   - Timeout: 504 Gateway Timeout
   
   // POST /config/api-key — Configurar chave
   - Status: 200 (sucesso) ou 400 (erro)
   - GET /config/api-key nunca retorna a chave em plaintext
   - Sempre retorna sucesso, nunca expõe se chave é válida
   ```

**Ferramenta:** Jest com `@nestjs/testing` + Playwright `request` context

**Cobertura esperada:** 70%+ de cobertura

---

### 2.3 Camada 3: Testes E2E com Playwright (30%)

**Foco:** Experiência completa do usuário, interface + API + backend

**O que testar:**

#### Fluxo 1: Estado Vazio (empty-state.spec.ts)
```typescript
Scenario: Novo usuário abre app
1. URL /
2. Verificar: "Nenhuma tarefa ainda" aparece
3. Verificar: Botões "Criar Tarefa" e "Gerar com IA" visíveis
4. Verificar: Nenhuma tarefa na lista
5. Verificar: GET /tasks retorna []
```

#### Fluxo 2: Criação de Tarefa (task-creation.spec.ts)
```typescript
Scenario: Criar tarefa com título válido
1. Digitar "Aprender Playwright" no input
2. Clicar botão "Criar"
3. Verificar: Tarefa aparece na lista
4. Verificar: Campo limpo
5. Recarregar página
6. Verificar: Tarefa ainda existe (persistência)
7. GET /tasks → tarefa em resposta

Scenario: Tentar criar tarefa vazia
1. Clicar botão "Criar" sem digitar
2. Verificar: Botão desabilitado (antes do clique)
3. Verificar: Nenhuma requisição POST enviada

Scenario: Título com caracteres especiais
1. Digitar "<script>alert('xss')</script>"
2. Clicar botão "Criar"
3. Verificar: HTML é escapado no frontend e backend
4. Verificar: XSS não executa

Scenario: Título muito longo
1. Digitar 501 caracteres
2. Verificar: Campo rejeita entrada (max-length)
3. Verificar: Nenhuma requisição enviada
```

#### Fluxo 3: Conclusão e Desconclusão (task-completion.spec.ts)
```typescript
Scenario: Marcar tarefa como concluída
1. Criar tarefa "Estudar TypeScript"
2. Clicar checkbox
3. Verificar: Visual muda (strikethrough, cor cinza, checkmark)
4. Verificar: PATCH /tasks/:id com completed: true
5. Recarregar página
6. Verificar: Tarefa ainda está marcada

Scenario: Desmarcar tarefa
1. Marcar tarefa como concluída
2. Clicar checkbox novamente
3. Verificar: Visual volta ao normal
4. Recarregar página
5. Verificar: Tarefa não está marcada

Scenario: Estado em transição
1. Marcar tarefa como concluída
2. Antes do servidor responder, recarregar página
3. Verificar: Estado final correto (otimistic update ou servidor?)
```

#### Fluxo 4: Exclusão com Confirmação (task-deletion.spec.ts)
```typescript
Scenario: Deletar tarefa com confirmação
1. Criar tarefa "Fazer café"
2. Clicar botão delete
3. Verificar: Dialog de confirmação aparece
4. Clicar "Cancelar"
5. Verificar: Tarefa ainda existe
6. Nenhuma requisição DELETE enviada

Scenario: Confirmar exclusão
1. Criar tarefa "Fazer café"
2. Clicar botão delete
3. Verificar: Dialog aparece
4. Clicar "Deletar"
5. Verificar: DELETE /tasks/:id enviado
6. Verificar: Tarefa desaparece da lista
7. Recarregar página
8. Verificar: Tarefa não existe
```

#### Fluxo 5: Geração com IA — Happy Path (task-ai-generation.spec.ts)
```typescript
Scenario: Gerar tarefas com IA (com API Key válida)
1. Inserir API Key válida
2. Digitar "Lançar um produto"
3. Clicar "Gerar com IA"
4. Verificar: Spinner aparece, botão desabilitado
5. Aguardar resposta (mock: 2-3 segundos)
6. Verificar: 3-5 tarefas aparecem na lista
7. Verificar: Cada tarefa tem indicador "Gerada por IA"
8. Recarregar página
9. Verificar: Tarefas persistem

Scenario: Gerar com limite de 20 tarefas
1. Mock IA retorna 21 tarefas
2. Clicar "Gerar"
3. Verificar: Apenas 20 tarefas adicionadas
4. Verificar: Aviso "Máximo de 20 tarefas por requisição"
```

#### Fluxo 6: Tratamento de Erros — Contrato de Erro (error-handling.spec.ts)
```typescript
Scenario: API Key inválida
1. Inserir API Key inválida
2. Clicar "Gerar com IA"
3. Verificar: Erro "Chave de API configurada é inválida"
4. Verificar: Link para configuração visível

Scenario: Timeout da API
1. Mock OpenRouter com timeout (30s+)
2. Clicar "Gerar com IA"
3. Aguardar > 30s
4. Verificar: Aviso "Solicitação demorando muito"
5. Verificar: Opção "Cancelar" visível
6. Clicar "Cancelar"
7. Verificar: Requisição cancelada, spinner some

Scenario: Resposta malformada da IA
1. Mock OpenRouter retorna "lixo incoerente"
2. Clicar "Gerar com IA"
3. Verificar: Erro "IA retornou resposta inválida"
4. Verificar: Nenhuma tarefa criada
5. Verificar: Texto da prompt mantém-se (para retry)

Scenario: Perda de conexão
1. Simulate offline (DevTools → Network → Offline)
2. Clicar "Gerar com IA"
3. Verificar: Erro "Conexão perdida"
4. Online novamente
5. Clicar "Gerar com IA"
6. Verificar: Funciona normalmente
```

---

## 3. Processo de Desenvolvimento para Antecipar Qualidade

### 3.1 Modificações no Workflow de Desenvolvimento

#### **PRÉ-DESENVOLVIMENTO: Code Review de Requisitos**

**Entrada:** PRD e design mockups  
**Participantes:** PO, Tech Lead, QA

**Checklist:**
- [ ] Cada RF tem critérios de aceitação claros?
- [ ] Cada RF tem cenários de erro definidos?
- [ ] RNF estão testáveis? (não apenas "deve ser rápido")
- [ ] Segurança foi considerada? (inputs, outputs, autenticação)
- [ ] Acessibilidade está no escopo?
- [ ] Dependências externas identificadas e mitigadas?

**Saída:** Documento de Requisitos Validado (evita PRD-001 a PRD-016)

---

#### **DURANTE DESENVOLVIMENTO: Test-First para Features de Risco**

**Estratégia:** TDD (Test-Driven Development) para funcionalidades críticas

**Aplicar para:**
- RF-05 (Geração IA) — OBRIGATÓRIO
- RF-06 (API Key) — OBRIGATÓRIO
- RF-03/RF-04 (Persistência) — OBRIGATÓRIO

---

#### **SECURITY CHECKLIST Por Feature**

Aplicar antes de merge:

**RF-02 (Criação de Tarefa):**
- [ ] Inputs escapados (XSS)?
- [ ] Validação no backend (não apenas frontend)?
- [ ] SQL injection testado (prepared statements)?

**RF-05 (Geração IA):**
- [ ] Timeout implementado?
- [ ] Rate limiting implementado?
- [ ] Parsing de resposta tratando edge cases?
- [ ] Nenhuma PII em logs?

**RF-06 (API Key):**
- [ ] Nunca em localStorage plaintext?
- [ ] Nunca em Network tab?
- [ ] Criptografada em BD?
- [ ] Nunca em logs?
- [ ] Nunca em console.log?

---

#### **ANTES DE MERGE: Test Gates**

``` markdown
- Cobertura de testes ≥ 70%
- Sem vulnerabilidades críticas (SonarQube/CodeQL)
- E2E testes passando em Chrome + Firefox + Safari
- Acessibilidade: 0 violações críticas (Axe)
- Performance: Lighthouse ≥ 90
```

---

### 3.2 Estrutura de Testes no Ciclo de Vida

```
REQUISITO → CODE REVIEW → DESENVOLVIMENTO (TDD)  → TESTES     → RELEASE

↓             ↓              ↓                        ↓         ↓            ↓
PRD-REVIEW   Checklist    Unitários +            E2E +       Monitoramento
             Segurança    Integração             Acessib.    Produção
             PRD-REVIEW   + Contrato             (30% E2E)   APM
                          (70% cobert)
```

---

### 3.3 Papéis e Responsabilidades

| Papel | Responsabilidade | Quando |
|---|---|---|
| **QA** | Revisar PRD, identificar riscos | PRÉ-DEV |
| **Tech Lead** | Validar arquitetura, segurança | PRÉ-DEV + CODE REVIEW |
| **Dev** | Implementar testes unitários, TDD | DESENVOLVIMENTO |
| **QA + Dev** | Escrever testes de integração | INTEGRAÇÃO |
| **QA** | Testes E2E, exploratórios | TESTES |
| **DevOps** | Monitorar performance, alertas | PRODUÇÃO |

---

### 3.4 Métricas de Qualidade a Rastrear

```
1. COBERTURA DE TESTES
   - Meta: 70%+ unitários + integração
   - Rastreamento: Por feature, por sprint

2. TAXA DE BUGS POR RELEASE
   - Meta: < 0.5 bugs críticos por 1000 linhas
   - Rastreamento: Críticos vs. altos vs. médios

3. TEMPO DE RESPOSTA DA API
   - Meta: p95 < 500ms (RF-05 < 10s com IA)
   - Rastreamento: Por endpoint, tendência

4. DISPONIBILIDADE
   - Meta: 99% (conforme RNF)
   - Rastreamento: Uptime real vs. esperado

5. ACESSIBILIDADE
   - Meta: 0 violações WCAG AA críticas
   - Rastreamento: Por página, por versão

6. SEGURANÇA
   - Meta: 0 vulnerabilidades críticas
   - Rastreamento: OWASP Top 10, pentest anual
```

---

## 4. Matriz de Testes por Requisito

| RF | Unitário | Integração (+ Contrato) | E2E | Segurança |
|---|---|---|---|---|
| RF-01 | 70% | 70% (60% + 10% contrato) | 100% | ✓ |
| RF-02 | 80% | 85% (75% + 10% contrato) | 100% | ✓✓ |
| RF-03 | 60% | 80% (75% + 5% contrato) | 100% | — |
| RF-04 | 60% | 80% (75% + 5% contrato) | 100% | — |
| RF-05 | 90% | 90% (85% + 5% contrato) | 100% | ✓✓✓ |
| RF-06 | 70% | 75% (65% + 10% contrato) | 80% | ✓✓✓ |

**Legenda:**
- % = Cobertura esperada nessa camada
- Integração inclui testes de contrato de API (status codes, schema validation)
- ✓ = Necessário teste de segurança
- ✓✓ = Teste de segurança crítico
- ✓✓✓ = Bloqueador, não merge sem passar

---

## 5. Conexão com PRD-REVIEW

Esta estratégia de teste **diretamente endereça** os 16 problemas identificados:

| PRD-REVIEW | Endereçado Por |
|---|---|
| PRD-001 (API Key insegura) | Testes de segurança integração + E2E |
| PRD-002 (Erros IA não tratados) | Testes error-handling.spec.ts |
| PRD-003 (Sem confirmação exclusão) | Testes task-deletion.spec.ts |
| PRD-004 (Validação de título) | Testes unitários + validação |
| PRD-005 (Validação de prompt) | Testes unitários + validação |
| PRD-006 (Formato IA não especificado) | Testes parsing + edge cases |
| PRD-007 (Empty state vago) | Testes empty-state.spec.ts |
| PRD-008 (Indicador carregamento) | Testes E2E da UX |
| PRD-009 (Diferenciação visual) | Testes E2E visual |
| PRD-010 (Feedback visual incompleto) | Testes task-completion.spec.ts |
| PRD-011 (Compatibilidade restritiva) | Testes multi-browser |
| PRD-012 (Responsividade vaga) | Testes viewport múltiplos |
| PRD-014 (Acessibilidade) | Testes Axe + manual |
| PRD-015 (Rate limiting) | Testes integração de limite |
| PRD-016 (Autenticação ambígua) | Testes de isolamento de dados |

---

## 6. Recomendações Finais

### Antes de Começar Desenvolvimento

1. **Code review do PRD com checklist de qualidade** ← Previne todos PRD-XXX
2. **Definir critérios de aceitação explícitos** ← PRD-002, PRD-003, PRD-008, PRD-010
3. **Security audit de RF-05 e RF-06** ← Previne PRD-001
4. **Acessibilidade no design** ← PRD-014

### Durante Desenvolvimento

1. **TDD obrigatório para RF-05, RF-06, RF-03/04** ← Previne bugs críticos
2. **Security checklist antes de merge** ← Previne vulnerabilidades
3. **Testes de integração para todas as mudanças de estado** ← Previne PRD-007, PRD-013

### Antes de Release

1. **E2E testes passando em 3+ browsers** ← PRD-011, PRD-012
2. **Acessibilidade: Axe sem violações críticas** ← PRD-014
3. **Rate limiting testado** ← PRD-015
4. **Teste manual dos cenários de erro** ← PRD-002

---