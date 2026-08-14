# Plan - Responsáveis e Times Evolution

Transform the "Responsáveis" module into a guided "Team Builder" experience and a professional hierarchical management center.

## User Review Required

> [!IMPORTANT]
> This plan involves adding a guided onboarding for new events and evolving the data model for teams (adding leader/member relationships). Existing data will be preserved.

- **Visual Style**: High-end dark theme (black/graphite) with gold accents. No generic AI aesthetics (no robots, no purple gradients, no emojis).
- **Recommendation Engine**: Deterministic logic based on event size and features.

## Proposed Changes

### 1. Data Model & Storage Evolution
- Update `Responsible` interface in `src/lib/forja-data.ts` to explicitly support `leaderId` or a `isLeader` flag within teams, and `expectedHeadcount`.
- Ensure `forja-sync` functions support the new fields.
- **Data Safety**: Reuse existing `responsibles` array. Areas will be grouped into "Teams" visually.

### 2. Team Builder (Onboarding Wizard)
- Create `src/components/forja/TeamBuilderWizard.tsx`.
- Implement a 5-step guided flow:
    1. **Event Size**: Attendee count shortcuts + manual input.
    2. **Features**: Multi-select cards (Stage, Speakers, Sound, Catering, etc.).
    3. **Complexity**: Conditional questions based on step 2 (e.g., "How many stages?").
    4. **Analysis**: 2-second deterministic "calculation" animation.
    5. **Suggestion**: Review recommended teams, headcount, and external providers.
- Implement the `recommendationEngine` utility in `src/lib/team-engine.ts`.

### 3. New "Responsáveis e Times" Interface
- Update `src/routes/_shell/responsaveis.tsx`.
- Add View Switcher: **Cards**, **Organograma**, **Lista**, **Times**.
- **Cards View**: Detailed team cards showing Leader (name/role/whatsapp) and Members (confirmed/vancant slots).
- **Organograma**: Enhance the `@xyflow/react` tree to support the new team structure.
- **Times View**: Focused view for individual team building.

### 4. Logic & Interactions
- Implement team editing: move members between teams, promote to leader.
- "Revisar Estrutura": Allow users to run the wizard again without overwriting existing assignments.
- "Smart Align": Auto-positioning in the Org Chart to prevent overlaps.

## Technical Details

- **Deterministic Engine**: Logic based on presets (e.g., 1 Receptionist per 50 guests, 1 Stage Manager if Stage > 0).
- **Views**: All 4 views consume the same `responsibles` array from `ForjaProvider`.
- **Performance**: Use `memo` for Org Chart nodes and heavy list rendering.

## Verification Plan

- **Preservation Test**: Ensure manual entries created before this update appear in the new "Responsáveis e Times" page.
- **Engine Coverage**: Test with 20, 100, and 500 guest scenarios via simulated wizard inputs.
- **Responsive Audit**: Check wizard and Org Chart on mobile viewports.
- **Persistence**: Verify that team groupings and manual positions survive a page reload.
