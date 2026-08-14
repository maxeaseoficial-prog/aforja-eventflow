# Plano de Implementação: Responsáveis e Times (Team Builder)

Evolução do módulo de Responsáveis para um sistema de gestão de equipes com assistente de configuração inteligente (Team Builder).

## 1. Alterações no Modelo de Dados (Schema)

*   **Arquivo:** `src/lib/forja-data.ts`
*   **Mudança:** Adicionar `teamId` (string) e `isLeader` (boolean) à interface `Responsible`. Isso permitirá agrupar responsáveis em times e identificar quem é o líder sem criar novas tabelas.
*   **Setores:** Expansão da constante `RESPONSIBLE_SECTORS` para incluir os ~70 setores do Mapa-Mestre (já realizado).

## 2. Recommendation Engine (Lógica de Negócio)

*   **Arquivo:** `src/lib/team-builder.ts`
*   **Função:** `generateTeamRecommendation(profile: EventProfile): TeamRecommendation[]`
*   **Lógica:** Determinística, baseada no número de convidados e complexidade (palcos, palestrantes, alimentação, etc.).
*   **Agrupamento:** Funções serão agrupadas em times (ex: Som, Luz e Vídeo em "Técnica / AV" para eventos pequenos).

## 3. Team Builder Wizard (UI/UX)

*   **Componentes:** Criar `src/components/forja/TeamBuilder/`
    *   `Wizard.tsx`: Container principal com stepper.
    *   `Step1Attendee.tsx`: Pergunta sobre público.
    *   `Step2Features.tsx`: Seleção de o que haverá no evento.
    *   `Step3Complexity.tsx`: Perguntas condicionais.
    *   `Step4Recommendation.tsx`: Exibição e edição da estrutura sugerida.
    *   `AnalysisScreen.tsx`: Tela de transição com feedbacks progressivos.

## 4. Visualizações da Central

*   A página de Responsáveis (`src/routes/_shell/responsaveis.tsx`) será atualizada para oferecer 4 modos:
    1.  **Cards:** (Novo) Visualização por times com líderes em destaque.
    2.  **Organograma:** (Atualizado) Reutilizar o engine `@xyflow/react` existente.
    3.  **Lista:** (Novo) Tabela compacta para visão operacional.
    4.  **Times:** (Novo) Foco em preenchimento de vagas por núcleo.

## 5. Compatibilidade e Migração

*   Dados existentes serão preservados. O Wizard só aparecerá se não houver dados ou via botão "Revisar estrutura".
*   O campo `parentId` continuará sendo usado para a hierarquia visual do Organograma, garantindo que a visualização atual não quebre.

## Detalhes Técnicos

*   **Engine:** Funções puras em TypeScript para facilidade de teste.
*   **Estado:** Utilização do `useForja` (Zustand/Context) para persistência em nuvem.
*   **Design:** Dourado queimado (#E6BC63), grafite e tipografia premium.
