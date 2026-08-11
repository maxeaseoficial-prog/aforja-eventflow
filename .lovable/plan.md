# Plano de Persistência em Nuvem — FORJA

Implementação de sincronização em nuvem (Lovable Cloud) com preservação integral dos dados locais e suporte offline.

## Ações Realizadas
- [x] Configuração do Lovable Cloud (Supabase).
- [x] Criação das tabelas `forja_app_state` e `forja_state_history` via migração SQL.
- [x] Implementação de Server Functions (`src/lib/forja-sync.functions.ts`) para leitura/escrita segura via Service Role no servidor.
- [x] Implementação de lógica de persistência híbrida no `ForjaProvider`:
    - Backup local automático em `forja-command-center-backup-before-cloud` antes da primeira sincronização.
    - Carregamento inicial do cache local para resposta instantânea.
    - Sincronização em background com a nuvem (Reconciliação baseada em revisões).
    - Persistência debounced (1s) para evitar sobrecarga.
    - Realtime habilitado via Supabase Channels para atualizações entre dispositivos.
- [x] UI de status de sincronização no cabeçalho.
- [x] Proteção contra reset acidental no módulo de configurações.

## Detalhes Técnicos

### Estrutura de Dados
- **Tabela**: `public.forja_app_state`
- **Campos**: `id` (PK, "forja-principal"), `state` (JSONB), `revision` (INT), `updated_at` (TIMESTAMPTZ).
- **Segurança**: RLS habilitado com políticas de acesso público (limitado pela camada de login admin/admin do app).

### Fluxo de Sincronização
1. **Hidratação**: O app lê o `localStorage` v2 imediatamente.
2. **Download**: Busca a revisão mais recente na nuvem. Se a nuvem for mais nova, atualiza o estado local.
3. **Upload**: Se a nuvem estiver vazia (primeiro uso), faz o upload do estado local.
4. **Edição**: Qualquer alteração no estado React aciona o salvamento no `localStorage` (instantâneo) e agenda um upload para a nuvem (debounce 1s).
5. **Realtime**: Se outro dispositivo salvar, este dispositivo recebe o evento e atualiza o estado automaticamente se a revisão for superior.

## Verificação
- O backup `forja-command-center-backup-before-cloud` garante que os dados pré-migração estão salvos no navegador original.
- O campo `revision` impede que um estado vazio sobrescreva um estado preenchido.
- O PWA mantém funcionamento offline total usando o cache local v2.
