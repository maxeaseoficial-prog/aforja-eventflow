# Plano de Implementação — Views de Lista e Colunas (Responsáveis)

Implementar as visualizações "Lista" e "Colunas" na aba de Responsáveis, refinando a interface para um padrão profissional, responsivo e focado em Command Center.

## Alterações

### 1. Visualização de Lista (`ListView`)
- Criar um componente de tabela premium dentro de `responsaveis.tsx`.
- Colunas: Responsável (Avatar + Nome/Status), Área (Título + Subtítulo), Time/Setor, Contato (WhatsApp).
- Mobile: Cards verticais compactos otimizados para leitura rápida.
- Ações rápidas de edição e exclusão integradas na linha.

### 2. Visualização de Colunas (`ColumnView` / Kanban-style)
- Organizar os responsáveis por **Setor** (DIREÇÃO, PRODUÇÃO, ÁUDIO, etc.).
- Scroll horizontal com `snap-align` para facilitar navegação em dispositivos móveis e desktops.
- Cada coluna exibe o total de pessoas e métricas de preenchimento do setor.
- Cards simplificados focados no status e nome do responsável.

### 3. Refinamento de UI e Métricas
- Renomear "Grade" para "Cards" na interface.
- Atualizar o cabeçalho para "Responsáveis e Times".
- Integrar as métricas de `getTeamMetrics` (do store) para exibir resumos por setor nas views.
- Garantir que o estado `preferredTeamView` persista corretamente no Supabase.

## Detalhes Técnicos
- Utilizar componentes de UI existentes (`Avatar`, `PersonStatusBadge`, `WhatsappButton`).
- Implementar `HorizontalScrollContainer` com CSS moderno para as Colunas.
- Garantir `overflow-x-auto` e `min-w-[300px]` por coluna.
- Tipagem rigorosa para evitar erros de `undefined` durante a renderização de dados parciais.
