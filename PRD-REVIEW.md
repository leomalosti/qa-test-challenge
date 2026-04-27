# PRD-REVIEW — Análise de Qualidade do Smart To-Do List

**Autor:** QA Engineer — Sinky  
**Data da Análise:** 24 de abril de 2026  
**Versão do PRD Analisado:** 1.2

---

## [PRD-001] Armazenamento e Segurança da API Key

**Requisito afetado:** RF-06  
**Categoria:** Segurança | Requisito ausente | Risco técnico

### Problema identificado

O requisito RF-06 especifica que o usuário deve fornecer sua API Key, mas não define **onde e como** essa chave será armazenada. A implementação atual provavelmente utiliza `localStorage`, o que expõe a chave a ataques XSS e furto de dados. Além disso, não há criptografia mencionada, o que viola boas práticas de segurança.

### Por que isso é um risco

- **Exposição a XSS:** Se a aplicação for comprometida por uma vulnerabilidade XSS, qualquer atacante pode acessar a API Key armazenada em `localStorage`
- **Roubo de dados:** A chave pode ser inspecionada via DevTools por qualquer pessoa com acesso ao navegador do usuário
- **Responsabilidade legal:** O armazenamento inseguro de credenciais de terceiros pode expor a Sinky a responsabilidades legais e perda de confiança do usuário
- **Custos não autorizados:** Um atacante pode usar a chave para fazer requisições à IA em nome do usuário, gerando custos

### Sugestão de melhoria

**RF-06 — Configuração de API Key do Provedor de IA (Revisado)**

Para utilizar a funcionalidade de geração por IA (RF-05), o usuário deve fornecer sua API Key de um provedor compatível.

**Armazenamento seguro:**
- A API Key deve ser enviada ao backend e armazenada em um banco de dados seguro, **nunca em localStorage ou sessionStorage**
- A chave deve ser criptografada em repouso
- O frontend nunca deve expor a chave em logs, console ou requests HTTP em texto plano
- As requisições de IA devem ser feitas **apenas pelo backend**, não pelo frontend

**Alternativa (menor segurança, mas viável):**
- Se a chave for armazenada no frontend, deve estar criptografada e ofuscada
- DevTools e JavaScript não devem conseguir acessá-la facilmente

**Critério de aceitação:**
- A API Key não deve aparecer em qualquer request visível ao cliente (Network tab do DevTools)
- A API Key não deve ser acessível via `localStorage.getItem()` ou similar
- Testes de segurança devem validar que a chave está protegida

---

## [PRD-002] Tratamento de Erros na Geração por IA Não Especificado

**Requisito afetado:** RF-05  
**Categoria:** Requisito ausente | Critério de aceitação incompleto

### Problema identificado

O requisito RF-05 descreve o "caminho feliz" da geração por IA, mas não define o que deve acontecer quando:
- A API de IA retorna um erro (timeout, rate limit, erro interno)
- A chave da API é inválida ou expirou
- A resposta da IA não segue o formato esperado (parsing falha)
- O usuário perde conexão durante o processamento
- A requisição demora muito (timeout)

Há apenas um risco técnico mencionado ("respostas não estruturadas"), mas sem especificação de como tratar isso.

### Por que isso é um risco

- **Experiência de usuário degradada:** Sem feedback claro, o usuário não sabe se a operação falhou ou está ainda processando
- **Perda de dados:** Se a aplicação travar ou recarregar, não há clareza sobre se as tarefas foram salvas
- **Suporte:** O time de suporte receberá relatos vagos como "a IA não funciona" sem informações suficientes para debugging
- **Confiabilidade:** Um erro silencioso pode levar o usuário a não tentar novamente, causando abandono (conforme a persona Marina do PRD)

### Sugestão de melhoria

```markdown
**RF-05 — Geração de Tarefas por IA (Revisado)**

**Tratamento de erros:**

1. **Erro da API (4xx, 5xx ou timeout):**
   - Exibir mensagem de erro clara: "Falha ao processar o objetivo. Por favor, tente novamente."
   - Incluir botão para repetir a requisição
   - Não descartar o texto do objetivo (manter pré-preenchido para retry)

2. **API Key inválida ou expirada:**
   - Exibir: "A chave de API configurada é inválida. Por favor, verifique e reinsira."
   - Oferecer um link rápido para o campo de configuração (RF-06)

3. **Resposta malformada (parsing falha):**
   - Log do erro no console para debugging
   - Exibir ao usuário: "A IA retornou uma resposta inválida. Por favor, tente descrever o objetivo de forma diferente."
   - Nenhuma tarefa deve ser criada

4. **Perda de conexão:**
   - Exibir: "Conexão perdida. Por favor, verifique sua conexão e tente novamente."
   - Permitir retry automático ou manual

5. **Timeout (> 30 segundos):**
   - Exibir: "A solicitação está demorando muito. Por favor, tente novamente ou simplifique o objetivo."
   - Oferecer opção de cancelar

**Critérios de aceitação:**
- [ ] Cada cenário de erro exibe uma mensagem clara e acionável
- [ ] O usuário sempre sabe se a operação falhou ou está em progresso
- [ ] Nenhuma tarefa é criada em caso de erro
- [ ] O texto do objetivo não é limpo automaticamente em caso de erro
```

---

## [PRD-003] Confirmação de Exclusão Não Especificada

**Requisito afetado:** RF-04  
**Categoria:** Critério de aceitação incompleto | Requisito ausente

### Problema identificado

RF-04 permite que o usuário delete uma tarefa, mas não especifica se deve haver uma confirmação (dialog, modal, etc.) antes de executar a exclusão permanentemente. A ausência de confirmação pode levar a exclusões acidentais, especialmente em dispositivos móveis ou em cliques acidentais.

### Por que isso é um risco

- **Ações irreversíveis:** Uma exclusão é permanente e não pode ser desfeita (não há undo mencionado)
- **Perda de dados:** O usuário pode deletar uma tarefa acidentalmente e não conseguir recuperá-la
- **Conformidade:** UX boas práticas sugerem confirmação para ações destrutivas
- **Suporte:** Usuários podem reclamar que "deletei por acidente" — aumentando volume de suporte

### Sugestão de melhoria

```markdown
**RF-04 — Exclusão de Tarefa (Revisado)**

O usuário deve poder excluir individualmente qualquer tarefa da lista.

**Confirmação:**
- Ao clicar no botão de exclusão, exibir um dialog/modal de confirmação:
  - Título: "Deletar tarefa?"
  - Mensagem: "Esta ação é permanente e não pode ser desfeita."
  - Botão "Cancelar" e "Deletar"

**Critérios de aceitação:**
- [ ] Dialog de confirmação exibe antes de qualquer exclusão
- [ ] Botão "Cancelar" fecha o dialog sem deletar
- [ ] Botão "Deletar" executa a exclusão e fecha o dialog
- [ ] Mensagem de sucesso aparece após exclusão (opcional: "Tarefa deletada")
```

---

## [PRD-004] Validação de Entrada Não Especificada para Títulos de Tarefa

**Requisito afetado:** RF-02, RF-01  
**Categoria:** Requisito ausente | Critério de aceitação incompleto

### Problema identificado

Não há especificação sobre validação de entrada para o campo de título:
- Título vazio é permitido?
- Há limite de caracteres mínimo ou máximo?
- Títulos duplicados são permitidos?
- Espaços em branco podem ser o "título" inteiro?
- Caracteres especiais ou HTML são escapados?

### Por que isso é um risco

- **Experiência inconsistente:** Um usuário pode criar uma tarefa vazia ou com apenas espaços, gerando confusão
- **Segurança (XSS):** Se caracteres especiais não forem escapados, um usuário malicioso pode injetar HTML/JS na lista de tarefas (refletido em outros usuários se houver múltiplas contas futuramente)
- **Banco de dados:** Sem validação no backend, dados inválidos podem ser persistidos
- **UI quebrada:** Tarefas muito longas podem quebrar o layout da lista

### Sugestão de melhoria

**RF-02 — Criação Manual de Tarefa (Revisado)**

O usuário deve poder criar uma nova tarefa manualmente, inserindo o título da tarefa em um formulário.

**Validação:**
- Título deve ter entre 3 e 500 caracteres
- Espaços em branco apenas não são aceitos
- Caracteres especiais são escapados (sem HTML/JS injetável)
- Títulos duplicados são permitidos, mas não recomendados (UX: sugerir "você já tem uma tarefa similar")

**Comportamento:**
- Se o título for vazio ou inválido, desabilitar o botão de confirmação
- Exibir feedback em tempo real: "Mínimo 3 caracteres"
- Após criação bem-sucedida, limpar o campo

**Critérios de aceitação:**
- [ ] Campo com menos de 3 caracteres: botão desabilitado
- [ ] Campo com 0 caracteres (vazio): botão desabilitado
- [ ] Campo com apenas espaços: botão desabilitado
- [ ] Caracteres especiais são escapados no backend
- [ ] Tarefa com exatamente 3 caracteres é criada com sucesso
- [ ] Tarefa com 500 caracteres é criada com sucesso
- [ ] Tarefa com 501 caracteres: campo rejeita entrada ou trunca

---

## [PRD-005] Validação da Descrição do Objetivo para IA Não Especificada

**Requisito afetado:** RF-05  
**Categoria:** Requisito ausente | Critério de aceitação incompleto

### Problema identificado

RF-05 permite que o usuário "descreva um objetivo em linguagem natural", mas não há especificação sobre:
- Comprimento mínimo ou máximo do objetivo
- Formato aceito (texto livre, estruturado?)
- Idioma esperado
- O que acontece com descrições muito vagas ou em idioma não suportado

### Por que isso é um risco

- **Qualidade de resultado:** Uma descrição vaga ("fazer coisas") resultará em tarefas inúteis, degradando a percepção de qualidade da IA
- **Custos:** Requisições de descrições muito longas custarão mais para o usuário
- **Experiência:** Sem direcionamento, o usuário pode se perder sem saber como usar a feature

### Sugestão de melhoria

**RF-05 — Geração de Tarefas por IA (Revisado — Validação)**

[...conteúdo anterior...]

**Validação de entrada:**
- Objetivo deve ter entre 10 e 1000 caracteres
- Deve conter pelo menos uma palavra-chave significativa (evitar spam)
- Sugestão: mostrar "Exemplo: Lançar meu produto" para guiar o usuário

**Feedback:**
- Se < 10 caracteres: aviso "Descreva melhor seu objetivo (mínimo 10 caracteres)"
- Se > 1000 caracteres: aviso "Descrição muito longa (máximo 1000 caracteres)"

**Critérios de aceitação:**
- [ ] Campo com < 10 caracteres: botão de gerar desabilitado
- [ ] Campo com ≥ 10 e ≤ 1000 caracteres: botão habilitado
- [ ] Campo com > 1000 caracteres: campo rejeita entrada ou trunca

---

## [PRD-006] Formato de Resposta da IA Não Especificado

**Requisito afetado:** RF-05  
**Categoria:** Requisito ausente | Risco técnico

### Problema identificado

O PRD menciona que o sistema deve "processar a resposta recebida e extrair as subtarefas sugeridas", mas não há especificação de:
- Qual é o **formato exato** esperado da resposta (JSON, estruturado, free text?)
- Quantas tarefas no mínimo/máximo devem ser extraídas
- O que fazer se a IA retornar 0 tarefas ou 100 tarefas

### Por que isso é um risco

- **Inconsistência de parsing:** O código pode quebrar com respostas não esperadas (mencionado como risco técnico, mas sem solução)
- **Experiência inconsistente:** Às vezes gera muitas tarefas, às vezes poucas
- **Testes impossíveis:** Sem especificação, é impossível escrever testes confiáveis para validar o parsing

### Sugestão de melhoria

**RF-05 — Geração de Tarefas por IA (Revisado — Formato)**

[...conteúdo anterior...]

**Formato esperado da resposta:**
- O provedor (OpenRouter, OpenAI) retorna um texto em formato livre
- O backend deve extrair as subtarefas usando padrões:
  - Numeradas: "1. Fazer X", "2. Fazer Y"
  - Com bullet points: "- Fazer X", "• Fazer Y"
  - Separadas por quebras de linha simples

**Validações:**
- Mínimo: 1 subtarefa extraída
- Máximo: 20 subtarefas extraídas
- Se < 1: exibir erro "Não consegui gerar tarefas. Tente descrever o objetivo de forma diferente"
- Se > 20: usar as primeiras 20 e avisar "Geradas 20 tarefas (máximo por requisição)"

**Parsing seguro:**
- Cada subtarefa deve ter entre 5 e 200 caracteres
- Remover numeração e bullet points antes de salvar
- Trim espaços em branco

**Critérios de aceitação:**
- [ ] Resposta com 1 subtarefa: cria 1 tarefa com sucesso
- [ ] Resposta com 20 subtarefas: cria 20 tarefas com sucesso
- [ ] Resposta com 21 subtarefas: cria 20 tarefas e mostra aviso
- [ ] Resposta com 0 subtarefas: exibir erro adequado
- [ ] Subtarefas com caracteres especiais: escapadas corretamente
```

---

## [PRD-007] Empty State Não Especificado

**Requisito afetado:** RF-01  
**Categoria:** Requisito ausente | Critério de aceitação incompleto

### Problema identificado

RF-01 descreve como "exibir todas as tarefas", mas não especifica o que deve aparecer quando **não há tarefas** (empty state):
- Qual mensagem deve ser exibida?
- Deve haver um CTA (call-to-action) para criar a primeira tarefa?
- Qual é o visual? Ícone, imagem, texto?

### Por que isso é um risco

- **Experiência confusa:** Um novo usuário vê uma página em branco sem saber o que fazer
- **Taxa de abandono:** Conforme as personas do PRD, usuários com baixa tolerância (Marina) podem abandonar
- **Métricas de negócio:** Afeta a métrica "% de usuários que criam ≥1 tarefa na 1ª sessão"

### Sugestão de melhoria

```markdown
**RF-01 — Listagem de Tarefas (Revisado — Empty State)**

[...conteúdo anterior...]

**Empty state (quando não há tarefas):**
- Exibir um ícone ou ilustração
- Mensagem: "Nenhuma tarefa ainda"
- Texto adicional: "Crie uma tarefa manualmente ou use a IA para gerar um plano"
- CTAs: 
  - Botão destacado "Criar Tarefa"
  - Botão secundário "Gerar com IA"

**Critérios de aceitação:**
- [ ] Página vazia exibe mensagem clara
- [ ] CTAs são visíveis e funcionais
- [ ] Clicar nos botões navega para o formulário apropriado
```

---

## [PRD-008] Indicador de Carregamento Muito Vago

**Requisito afetado:** RF-05  
**Categoria:** Ambiguidade | Critério de aceitação incompleto

### Problema identificado

RF-05 menciona "exibir um indicador de carregamento", mas não especifica:
- Tipo: spinner, barra de progresso, skeleton screens?
- Localização: inline no botão, overlay, modal?
- Mensagem acompanhante?
- Tempo esperado (para ajustar expectativas)?
- Cancelamento: o usuário pode cancelar a requisição?

### Por que isso é um risco

- **Experiência inconsistente:** Time de design e desenvolvimento podem implementar de formas diferentes
- **Expectativas:** Usuário pode não saber quanto tempo esperar
- **Design quebrado:** Sem especificação de local, pode piorar a UX

### Sugestão de melhoria

```markdown
**RF-05 — Geração de Tarefas por IA (Revisado — Indicador de Carregamento)**

[...conteúdo anterior...]

**Indicador de carregamento:**
- **Tipo:** Spinner CSS ou ícone animado (não barra de progresso, pois duração é incerta)
- **Localização:** Dentro do botão "Gerar tarefas" (substituir texto do botão)
- **Mensagem:** Botão desabilitado com texto "Gerando..." ou apenas spinner
- **Tempo esperado:** Tipicamente 2-10 segundos (dependendo do provedor)
- **Cancelamento:** Opcional — se implementado, mostrar link "Cancelar" perto do spinner

**Critérios de aceitação:**
- [ ] Spinner aparece imediatamente após clicar "Gerar"
- [ ] Botão fica desabilitado durante o carregamento
- [ ] Spinner desaparece quando a resposta chega
- [ ] Se timeout > 30s, oferecer opção de cancelar
```

---

## [PRD-009] Diferenciação Visual de Tarefas Geradas vs. Manuais Muito Vaga

**Requisito afetado:** RF-01, RF-05  
**Categoria:** Ambiguidade | Critério de aceitação incompleto

### Problema identificado

O PRD menciona que tarefas geradas por IA devem ser "visualmente diferenciadas" e "visualmente identificadas", mas não especifica:
- Como? Ícone, badge, cor, estilo diferente?
- Onde fica localizado na UI?
- Qual é o objetivo: puramente informativo ou há interações diferentes?

### Por que isso é um risco

- **Inconsistência:** Design pode estar desalinhado com desenvolvimento
- **Acessibilidade:** Se apenas cor ou ícone sem texto, usuários com deficiência visual podem não conseguir diferenciar
- **Testes:** Impossível escrever critério de aceitação claro para validar

### Sugestão de melhoria

```markdown
**RF-01 — Listagem de Tarefas (Revisado — Diferenciação Visual)**

[...conteúdo anterior...]

**Diferenciação de tarefas geradas por IA:**
- **Indicador visual:** Ícone de "IA" ou "⚡" (16x16px) ao lado do título
- **Alternativa:** Badge com texto "Gerada por IA" (opcional, menos intrusivo)
- **Acessibilidade:** ARIA-label: "Tarefa gerada por IA"
- **Sem interações diferentes:** Tarefas geradas têm mesmas funcionalidades que manuais

**Critérios de aceitação:**
- [ ] Cada tarefa gerada por IA exibe ícone ou badge
- [ ] Tarefas manuais NÃO exibem esse indicador
- [ ] Indicador é acessível (alt text ou aria-label)
- [ ] Cliques e exclusões funcionam igual para ambas
```

---

## [PRD-010] Feedback Visual para Estado de Conclusão Não Especificado

**Requisito afetado:** RF-03  
**Categoria:** Ambiguidade | Critério de aceitação incompleto

### Problema identificado

RF-03 menciona que a tarefa deve "exibir feedback visual ao ser marcada como concluída", mas não especifica:
- Qual feedback? Strikethrough, cor cinza, ícone com checkmark, animação?
- Transição? Imediata ou animada?
- Acessibilidade? Como leitores de tela sabem que mudou de estado?

### Por que isso é um risco

- **Inconsistência visual:** Desenvolvimento e design podem fazer coisas diferentes
- **Acessibilidade:** Apenas visual não é suficiente para usuários com deficiência visual
- **Testes:** Critério muito vago para escrever testes automatizados

### Sugestão de melhoria

```markdown
**RF-03 — Marcar Tarefa como Concluída (Revisado)**

[...conteúdo anterior...]

**Feedback visual:**
- **Visual:** Strikethrough no título + ícone checkmark + cor cinzenta (RGB 128, 128, 128)
- **Animação:** Transição suave (300ms) de opacidade
- **Imediato:** Feedback aparece instantaneamente no client (antes de confirmar no servidor)
- **Acessibilidade:** 
  - ARIA-checked="true/false"
  - Anúncio para leitores de tela: "Tarefa marcada como concluída"

**Critérios de aceitação:**
- [ ] Ao clicar no checkbox, visual muda imediatamente
- [ ] Strikethrough é aplicado ao título
- [ ] Cor muda para cinzenta
- [ ] Checkmark aparece
- [ ] Recarregar página: estado persiste
- [ ] ARIA-checked está correto
- [ ] Leitores de tela anunciam a mudança
```

---

## [PRD-011] Compatibilidade de Browsers Muito Restritiva

**Requisito afetado:** RNF (Compatibilidade)  
**Categoria:** Critério de aceitação incompleto | Ambiguidade

### Problema identificado

O PRD menciona compatibilidade com "Chrome e Firefox (duas últimas versões estáveis)", mas não especifica:
- Safari é suportado?
- Edge é suportado?
- Mobile browsers (Chrome Mobile, Firefox Mobile)?
- Internet Explorer / Edge Legacy?
- Qual é o comportamento em browsers não suportados? Aviso, funcionalidade degradada?

A decisão de excluir Safari é significativa considerando que Marina (uma das personas) pode usar iPhone.

### Por que isso é um risco

- **Fragmentação de usuários:** Usuários em Safari receberão uma experiência ruim ou quebrada
- **Conflito com personas:** Marina pode ser usuária de iPhone/Safari, conflitando com suporte alegado para mobile
- **Testes:** Sem clareza, time de teste pode não cobrir certos browsers
- **Suporte:** Usuários em Safari relatar "a app não funciona"

### Sugestão de melhoria

```markdown
**Compatibilidade (Revisado)**

- **Desktop:** Chrome, Firefox, Safari, Edge (2 últimas versões estáveis)
- **Mobile:** Chrome Mobile, Firefox Mobile, Safari iOS (2 últimas versões)
- **Exclusões:** Internet Explorer, Edge Legacy (< v79)

**Comportamento em browsers não suportados:**
- Exibir banner: "Seu navegador pode não ser totalmente compatível"
- Oferecer sugestão de upgrade ou usar navegador alternativo

**Critérios de aceitação:**
- [ ] Chrome 125+, Firefox 124+: totalmente funcional
- [ ] Safari 17+: totalmente funcional
- [ ] Edge 125+: totalmente funcional
- [ ] Testes executados em pelo menos 3 browsers
```

---

## [PRD-012] Responsividade com Limite Mínimo Muito Pequeno

**Requisito afetado:** RNF (Responsividade)  
**Categoria:** Critério de aceitação incompleto | Ambiguidade

### Problema identificado

O PRD menciona "utilizável em telas a partir de 375px", mas:
- 375px é muito apertado (iPhone SE, modelos antigos)
- Não há especificação de como a layout se comporta (collapse, scroll horizontal, reflow?)
- Não está claro se é mobile-first ou desktop-first
- Tablets (768px+) não são mencionados

### Por que isso é um risco

- **UX degradada:** Em 375px, muitos componentes não cabem naturalmente
- **Testes:** Sem clareza, testes podem não cobrir certos tamanhos
- **Implementação:** Developers podem fazer layout desktop e tentar "encaixotar" para mobile

### Sugestão de melhoria

```markdown
**Responsividade (Revisado)**

O layout deve ser utilizável em telas a partir de 375px de largura e escalar até 4K (3840px).

**Breakpoints:**
- **Mobile (< 768px):** Layout vertical, single column, toque-friendly (48px min height)
- **Tablet (768px - 1024px):** Layout otimizado para landscape
- **Desktop (> 1024px):** Layout horizontal, múltiplas colunas se aplicável

**Comportamentos:**
- Sem scroll horizontal em qualquer viewport
- Texto legível em 375px (mín. 16px font)
- Botões são toque-friendly em mobile (mín. 44x44px)

**Critérios de aceitação:**
- [ ] 375px: layout reflow, sem scroll horizontal
- [ ] 768px: transição suave
- [ ] 1024px: layout desktop funcional
- [ ] 3840px: layout não quebra ou fica descentralizado
```

---

## [PRD-013] Requisito Ausente: Persistência de Dados

**Requisito afetado:** RF-02, RF-03, RF-04, RF-05  
**Categoria:** Requisito ausente | Critério de aceitação incompleto

### Problema identificado

O PRD menciona várias vezes que "a mudança persiste" ou "a tarefa aparece na lista", mas não especifica:
- Onde os dados são persistidos? (Backend, API)
- Quando? Imediatamente ou em batch?
- O que acontece se a requisição de persistência falhar?
- Há sincronização com o servidor? Offline mode?

### Por que isso é um risco

- **Perda de dados:** Se não houver feedback sobre persistência, usuário pode pensar que algo foi salvo quando não foi
- **Inconsistência:** Recarregar página pode mostrar dados diferentes
- **Offline:** Não está claro se a app funciona offline (ele não funciona, conforme fora do escopo, mas deve ser claro)

### Sugestão de melhoria

```markdown
**[Novo] RF-07 — Persistência de Dados**

Todas as mudanças (criação, conclusão, exclusão) devem ser persistidas no backend imediatamente.

**Requisitos:**
- Cada ação deve fazer uma requisição HTTP ao backend
- Sucesso: tarefa reflete no servidor (pode ser verificado via API)
- Falha: exibir mensagem de erro ao usuário e oferecer retry

**Offline:**
- Se o usuário perder conexão e tentar criar/editar: exibir erro "Conexão perdida"
- Não armazenar em localStorage para sincronizar depois (fora do escopo v1.0)

**Critérios de aceitação:**
- [ ] Criar tarefa: POST /tasks, status 201
- [ ] Marcar completa: PATCH /tasks/:id, status 200
- [ ] Deletar tarefa: DELETE /tasks/:id, status 204
- [ ] Recarregar página: tarefas carregadas do servidor
- [ ] Falha de conexão: mensagem clara ao usuário
```

---

## [PRD-014] Acessibilidade Não Especificada

**Requisito afetado:** Geral (todas as RFs)  
**Categoria:** Requisito ausente | Acessibilidade

### Problema identificado

Não há requisitos explícitos de acessibilidade (WCAG 2.1 AA):
- Sem especificação de contraste de cores
- Sem menção a ARIA labels
- Sem keyboard navigation
- Sem anúncios de estado para leitores de tela
- Sem teste de acessibilidade

### Por que isso é um risco

- **Exclusão:** Usuários com deficiências visuais, auditivas ou motoras podem não conseguir usar a app
- **Legal:** Dependendo da jurisdição, pode haver exigências legais de acessibilidade
- **Reputação:** Acessibilidade ruim danifica a imagem da marca

### Sugestão de melhoria

**[Novo] RNF — Acessibilidade**

A aplicação deve estar em conformidade com WCAG 2.1 nível AA.

**Requisitos mínimos:**
- Contraste de cor: 4.5:1 para texto normal, 3:1 para texto grande
- Keyboard navigation: todas as funções acessíveis via Tab/Enter
- ARIA labels: formulários, botões, regiões dinâmicas
- Leitores de tela: mudanças de estado anunciadas
- Sem dependência de cor apenas

**Testes:**
- Usar Axe DevTools ou WAVE para validar
- Testar com teclado (sem mouse)
- Testar com leitor de tela (NVDA ou JAWS)

**Critérios de aceitação:**
- [ ] Axe scan: 0 violações críticas
- [ ] Contraste: todas as cores ≥ 4.5:1
- [ ] Tab order: lógico e linear
- [ ] ARIA: labels em todos os inputs
- [ ] Mudanças de estado anunciadas

---

## [PRD-015] Rate Limiting e Limite de Custos Não Especificado

**Requisito afetado:** RF-05, RF-06  
**Categoria:** Requisito ausente | Risco técnico | Segurança

### Problema identificado

O PRD menciona que a API de IA é gratuita, mas não define:
- Rate limiting: quantas requisições por usuário por dia/hora?
- Limite de custos: há um cap para prevenir abuso?
- Proteção contra DDOS: como proteger a API de IA?
- Monitoramento: como rastrear custos?

### Por que isso é um risco

- **Custos descontrolados:** Um usuário malicioso pode disparar centenas de requisições, gerando custos
- **Disponibilidade:** Rate limiting do provedor externo pode deixar a feature indisponível
- **Abuso:** Sem limite, a app pode ser usada para spamear a IA gratuitamente
- **Monetização futura:** Sem limite, é impossível monetizar a feature depois

### Sugestão de melhoria

**[Novo] RF-08 — Rate Limiting e Proteção contra Abuso**

O sistema deve proteger contra abuso e custos descontrolados.

**Rate limiting:**
- Máximo 10 requisições de IA por usuário por hora
- Máximo 50 requisições por usuário por dia
- Exceder: exibir erro "Limite de requisições atingido. Tente novamente em X minutos"

**Proteção:**
- Validar que a API Key pertence ao usuário (não é compartilhada)
- Monitorar custos acumulados do provedor
- Alertar se custos excedem threshold (ex: $10/dia)

**Critérios de aceitação:**
- [ ] 11ª requisição em 1 hora: erro com mensagem clara
- [ ] Contador reseta a cada hora
- [ ] Logs rastreiam cada requisição para auditoria

---

## [PRD-016] Fluxo de Autenticação Fora do Escopo, mas Ambíguo

**Requisito afetado:** RF-06 (Configuração de API Key)  
**Categoria:** Ambiguidade | Requisito ausente

### Problema identificado

O PRD coloca "Autenticação e gestão de múltiplos usuários" fora do escopo v1.0, mas a aplicação **precisa** identificar usuários para persistir dados (RF-02, RF-03, RF-04). Não está claro:
- Como o sistema diferencia um usuário de outro?
- A aplicação é single-user?
- Como a API Key é associada a um usuário?
- Como dados de diferentes usuários são isolados?

### Por que isso é um risco

- **Segurança:** Sem isolamento de usuários, um usuário pode ver/deletar dados de outro
- **Design incoerente:** Fora do escopo, mas necessário para funcionar
- **Implementação:** Developers podem não saber como resolver esse conflito

### Sugestão de melhoria

**Clarificação necessária no PRD:**

Adicionar uma seção em "Fora do Escopo — v1.0":

"**Nota importante:** Embora autenticação multi-usuário esteja fora do escopo v1.0, 
a aplicação deve ser projetada para suportar isolamento de usuários futuramente. 

Para v1.0, assumimos um modelo single-user (um browser = um usuário). 
Dados são armazenados em localStorage e/ou backend sem autenticação.

**Implementação v1.0:**
- Frontend: localStorage para identificar sessão
- Backend: sem autenticação, mas com planejamento para adicioná-la em v1.1

**Mudanças necessárias em v1.1:**
- Adicionar autenticação (login/senha ou OAuth)
- Isolar tarefas por user_id
- Proteger endpoints com JWT/session

---

## Resumo Executivo

Total de 16 problemas identificados, categorizados:

| Categoria | Quantidade |
| --- | --- |
| Requisito Ausente | 6 |
| Critério de Aceitação Incompleto | 9 |
| Ambiguidade | 5 |
| Risco Técnico | 4 |
| Segurança | 3 |
| Acessibilidade | 1 |

### Impacto Estimado por Severidade

| Severidade | Itens | Razão |
| --- | --- | --- |
| Crítica | PRD-001, PRD-002, PRD-014 | Segurança, UX, acessibilidade |
| Alta | PRD-003, PRD-007, PRD-015 | Experiência do usuário, integridade de dados |
| Média | PRD-004, PRD-005, PRD-006, PRD-009, PRD-010, PRD-012, PRD-016 | Consistência, qualidade |
| Baixa | PRD-008, PRD-011, PRD-013 | Nice-to-have, clarificações |

### Próximos Passos Recomendados

1. **Antes de continuar o desenvolvimento:** Validar PRD-001 (segurança), PRD-002 (tratamento de erros), PRD-007 (persistência)
2. **Refinar com Product:** PRD-016 (escopo/autenticação), PRD-014 (acessibilidade)
3. **Design system:** PRD-008, PRD-009, PRD-010 (consistência visual)
4. **Testes:** Todos os itens devem ter critérios de aceitação claros antes de teste

---