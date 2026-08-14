# Plan - Team Builder & Responsibles Evolution

Correct the implementation of "Responsáveis e Times" to use a Team-centric model (Team -> Leader -> Members) instead of the legacy individual-area model, and implement the 4 requested visualizations.

## 1. Data Model & Store Updates
- Update `Responsible` interface in `src/lib/forja-data.ts` to fully support `teamId`, `isLeader`, and `teamSize` (already partially there but needs standardization).
- Update `src/components/forja/store.tsx`:
    - Add `preferredTeamView` to the event state.
    - Standardize metrics calculation (`getTeamMetrics`).
    - Fix `addResponsible` to handle team positions correctly.
    - Add methods to manage team members within a team.

## 2. Team Builder Engine Correction
- Modify `src/lib/team-builder.ts`:
    - Ensure `convertRecommendationToResponsibles` creates ONE record for the team (the leader position) and defines the member slots as positions within that team, OR ensure the UI aggregates multiple records by `teamId`.
    - Preference: Model each "slot" as a record but ensure they all share a `teamId` and the UI handles them as a single group.

## 3. Step 5 of the Wizard
- Update `src/components/forja/TeamBuilder/Wizard.tsx` and `useTeamBuilderWizard.ts`:
    - Add Step 5: "Como você quer visualizar seu time?".
    - Implement a premium selectable layout with 4 options (Cards, Organograma, Lista, Colunas).
    - Save the selection to the event state.

## 4. Four Main Visualizations
- Redesign `src/routes/_shell/responsaveis.tsx`:
    - Implement the operational summary at the top (Total people, Times, Leaders, Open slots).
    - Replace the Grid/Organograma toggle with a 4-view toolbar.
    - **Visualização 1: Cards**: Implement the "Team Card" design showing Leader and Member summary.
    - **Visualização 2: Organograma**: Update `OrganogramaTree.tsx` to group by Team and allow expansion.
    - **Visualização 3: Lista**: Create a compact table view.
    - **Visualização 4: Colunas**: Create a board-style view where columns are teams.

## 5. UI/UX Refinements
- Use high-quality components from `shadcn/ui` and `lucide-react`.
- Ensure responsive behavior for all 4 views.
- Replace the "Apagar todos" button location to be less prominent.

## Technical Details
- Use `preferredTeamView` for persistence.
- Standardize `teamSize` to include the leader.
- Maintain compatibility with existing individual records by treating them as "Single-person teams" if no `teamId` is present.
