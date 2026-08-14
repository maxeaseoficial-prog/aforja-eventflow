---
name: Consolidar Visualização Colunas
description: Transforma a aba de Responsáveis em uma experiência única de Colunas (Times), refinando a hierarquia Líder/Integrantes e simplificando o fluxo.
type: feature
---

## Objetivos
- Consolidar a visualização **Colunas** como a única interface operacional para "Responsáveis e Times".
- Remover visualizações obsoletas (Cards, Organograma, Lista) e o seletor de visualizações.
- Implementar hierarquia clara: **Líder do Time** (destaque e primeiro da lista) e **Integrantes**.
- Refinar o Team Builder para pular a escolha de layout e entrar diretamente em Colunas.
- Melhorar métricas globais e contextuais (Time completo, vagas abertas).

## Ações Técnicas

### 1. Modelagem e Store (`src/components/forja/store.tsx`)
- Atualizar `ForjaState` para fixar `preferredTeamView: "colunas"`.
- Ajustar `useForjaMetrics` para reportar métricas de times (líderes definidos, vagas abertas) em vez de apenas "áreas sem responsável".
- Garantir que a lógica de "Novo Time" (ex-Nova Área) mantenha a integridade dos dados.

### 2. Interface de Responsáveis (`src/routes/_shell/responsaveis.tsx`)
- **Remoções:** Remover `handleViewChange`, o seletor de botões (Cards/Organograma/Lista) e o `EditResponsibleDialog` antigo (substituí-lo por um mais contextual).
- **Consolidação:** Definir `ColumnView` como o componente principal renderizado.
- **Hierarquia na Coluna:**
  - Separar `responsibles` por setor.
  - No `ColumnView`, identificar o `isLeader: true`. Se não houver, mostrar slot "[ + Definir Líder ]".
  - Listar integrantes abaixo com slots baseados no `teamSize`.
- **Modais Contextuais:**
  - Ao clicar em "Definir Líder" ou "Definir Integrante", abrir o formulário com `teamId`/`sector` pré-preenchido e bloqueado.
  - Título do modal dinâmico: "Definir líder do time" ou "Adicionar integrante".
- **Limpeza:** Mover "Apagar estrutura" para um menu de opções secundário.

### 3. Team Builder (`src/components/forja/TeamBuilder/Wizard.tsx` & `useTeamBuilderWizard.ts`)
- Remover o Passo 5 (escolha de visualização).
- Ajustar o CTA final para "Confirmar e Criar" e redirecionar diretamente para a visualização de colunas.

### 4. Layout e Métricas
- Atualizar o cabeçalho para "Responsáveis e Times".
- Adicionar resumo global real no topo: "X pessoas previstas | Y times | Z líderes definidos | W vagas abertas".
- Remover filtros antigos (Confirmado, Pendente, etc.) da barra superior.

## Invariantes
- **NÃO** apagar dados existentes.
- **NÃO** resetar banco ou localStorage.
- **NÃO** refazer o motor de recomendação (recommendation engine).
- **NÃO** usar drag-and-drop nesta etapa.
