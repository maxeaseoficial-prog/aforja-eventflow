# Forja Command

Crie uma aplicação web responsiva chamada FORJA — Event Command Center, desenvolvida para centralizar toda a organização, planejamento e execução do evento A Forja.

O sistema NÃO deve parecer um site institucional. Deve parecer um software profissional de gestão de eventos, com experiência semelhante a ferramentas como Linear, Notion, ClickUp e Monday, porém com identidade visual própria da Forja.

O objetivo principal é permitir que toda a organização do evento seja gerenciada dentro de um único painel, incluindo:

Equipe e responsáveis

Contatos

Tarefas

Compras

Cronograma

Programação do evento

Palestrantes

Staff

Mídia

Storymaker

Som

Iluminação

Estrutura

Coffee Break

Recepção

Brindes

Credenciamento

Checklist técnico

Plano de contingência

Pós-evento

1. CONCEITO VISUAL

A identidade do sistema deve transmitir:

Força

Organização

Liderança

Transformação

Fogo

Forja

Metal

Pressão

Performance

Profissionalismo

Porém, NÃO criar um visual exagerado, medieval ou carregado.

Quero um sistema:

Premium

Minimalista

Moderno

Limpo

Elegante

Escuro

Extremamente organizado

Fácil de utilizar

Usar a temática da Forja de maneira sutil.

2. IDENTIDADE VISUAL

Criar interface predominantemente em DARK MODE.

Paleta sugerida:

Background principal:
#090909

Background secundário:
#101010

Cards:
#151515

Cards em hover:
#1B1B1B

Bordas:
rgba(255,255,255,0.08)

Texto principal:
#F5F5F5

Texto secundário:
#A1A1AA

Cor principal de destaque:
laranja queimado / fogo

Exemplo:
#FF5A1F

Cor secundária:
#FF8A3D

Sucesso:
verde

Alerta:
amarelo

Erro:
vermelho

Não usar muitas cores simultaneamente.

O laranja deve aparecer principalmente em:

botões

progresso

ícones ativos

indicadores

pequenos detalhes

elementos importantes

3. TIPOGRAFIA

Utilizar uma fonte extremamente moderna e limpa.

Sugestões:

Inter
Manrope
Geist
Satoshi

Títulos fortes.

Textos menores e bem distribuídos.

Evitar blocos enormes de texto.

Priorizar leitura rápida.

4. MOTION DESIGN

Adicionar motion profissional e extremamente suave.

Nada exagerado.

Usar animações de aproximadamente:

150ms a 300ms.

Adicionar:

fade-in suave nos cards

microanimação de hover

leve movimento vertical ao abrir elementos

transições suaves entre páginas

animação de progresso

animação de conclusão de tarefas

expansão suave de accordions

sidebar animada

modal entrando suavemente

dropdowns fluidos

skeleton loading

feedback visual após salvar algo

Quando uma tarefa for marcada como concluída:

checkbox animado

pequeno feedback verde

texto atualizado suavemente

Pode existir um efeito extremamente sutil de brilho laranja em elementos importantes.

Nunca utilizar animações exageradas.

5. ESTRUTURA PRINCIPAL

Criar uma SIDEBAR fixa no desktop.

No mobile, transformar em menu lateral.

No topo da sidebar colocar:

Logo / nome:

A FORJA

Subtítulo pequeno:

EVENT COMMAND CENTER

Menu:

Dashboard
Responsáveis
Tarefas
Compras
Programação
Palestrantes
Staff
Mídia
Estrutura
Experiência
Contingências
Pós-evento
Configurações

Usar ícones modernos da biblioteca Lucide.

6. HEADER

Criar header superior.

Lado esquerdo:

Título da página atual.

Exemplo:

Dashboard

Texto menor:

Visão geral da organização da Forja.

Lado direito:

Indicador de dias restantes.

Exemplo:

18 dias para A Forja

Botão:

Nova tarefa

Ícone de notificações.

Avatar do usuário.

7. DASHBOARD

O Dashboard deve ser o verdadeiro CENTRO DE COMANDO DO EVENTO.

No topo apresentar:

FORJA

Nome do evento.

Data do evento.

Local.

Contagem regressiva.

Exemplo:

18 DIAS
04 HORAS
32 MINUTOS

Não precisa necessariamente mostrar segundos.

Criar um bloco bonito e premium para isso.

8. CARDS DE INDICADORES

Mostrar cards:

Tarefas totais
Tarefas concluídas
Tarefas pendentes
Tarefas atrasadas
Compras pendentes
Equipe confirmada

Exemplo:

82
Tarefas

57
Concluídas

19
Pendentes

6
Atrasadas

12
Compras pendentes

24
Pessoas na equipe

Mostrar pequenas comparações ou porcentagens.

Exemplo:

69% do evento organizado.

9. PROGRESSO GERAL DO EVENTO

Criar card grande:

PROGRESSO DA FORJA

Mostrar:

barra de progresso

Exemplo:

72%

Separar progresso por categoria:

Equipe — 90%
Estrutura — 70%
Mídia — 65%
Palestrantes — 80%
Compras — 55%
Programação — 90%

Utilizar barras horizontais modernas.

10. ALERTAS IMPORTANTES

Criar seção:

ATENÇÃO NECESSÁRIA

Mostrar automaticamente itens como:

3 tarefas atrasadas
2 compras sem responsável
1 palestrante ainda não confirmado
4 tarefas vencem hoje

Cada alerta deve ser clicável.

11. PRÓXIMAS TAREFAS

Criar painel:

PRÓXIMAS TAREFAS

Cada tarefa mostrar:

Nome

Categoria

Responsável

Prazo

Prioridade

Status

Checkbox

Exemplo:

Finalizar palestra de abertura

Responsável:
Henrique

Prazo:
12 Ago

Prioridade:
Alta

Status:
Em andamento

12. RESPONSÁVEIS

Criar página:

RESPONSÁVEIS

Mostrar todos os responsáveis pelo evento.

Cada responsável deve possuir:

Foto/avatar

Nome

Função

WhatsApp

Área

Status

Observações

As principais áreas iniciais devem ser:

Coordenação Geral

Som

Iluminação

Telão / Projeção

Equipe de Mídia

Storymaker

Recepção

Credenciamento

Coffee Break

Palco / Bastidores

Palestrantes

Staff

Segurança

Limpeza

Brindes

Fotografia

Videomaker

Permitir criar novas áreas.

13. CARD DE RESPONSÁVEL

Exemplo:

Som / Áudio

Responsável:
João Silva

WhatsApp:
(42) 99999-9999

Status:
Confirmado

Botões:

Editar
WhatsApp

Ao clicar em WhatsApp abrir:

https://wa.me/

com o número cadastrado.

14. RESPONSÁVEL NÃO DEFINIDO

Caso uma área ainda não tenha responsável:

Mostrar claramente:

RESPONSÁVEL NÃO DEFINIDO

Botão:

Adicionar responsável

Mostrar isso também como alerta no Dashboard.

15. TAREFAS

Criar módulo completo de gerenciamento de tarefas.

Permitir visualização:

Lista
Kanban

Filtros:

Todas
Hoje
Esta semana
Atrasadas
Concluídas

16. CAMPOS DAS TAREFAS

Toda tarefa deve possuir:

Título

Descrição

Categoria

Responsável

WhatsApp do responsável

Data de criação

Prazo

Prioridade

Status

Observações

Checklist interno

Anexos

Categorias sugeridas:

Geral

Mídia

Som

Iluminação

Palestra

Staff

Compras

Estrutura

Recepção

Coffee Break

Programação

Marketing

Pós-evento

17. STATUS DAS TAREFAS

Criar:

Não iniciado

Em andamento

Aguardando

Concluído

Problema

18. PRIORIDADE

Criar:

Baixa

Média

Alta

Urgente

Usar cores discretas.

19. KANBAN

Criar Kanban com colunas:

Não iniciado

Em andamento

Aguardando

Concluído

Permitir DRAG AND DROP.

Ao mover um card:

atualizar automaticamente o status.

20. COMPRAS

Criar página:

COMPRAS

Objetivo:

controlar tudo o que precisa ser comprado ou contratado para o evento.

Campos:

Item

Categoria

Quantidade

Valor previsto

Valor real

Responsável

WhatsApp

Fornecedor

Prazo

Status

Observações

21. CATEGORIAS DE COMPRAS

Inicialmente cadastrar:

Crachás staff

Crachás convidados

Cordões

Pulseiras

Brindes

Sacolas

Kits

Água

Café

Copos

Guardanapos

Alimentos

Canetas

Cadernos

Fita adesiva

Extensões

Filtros de linha

Pilhas

Cabos

Materiais de sinalização

Decoração

Carregadores

Power banks

Adaptadores

Materiais de primeiros socorros

22. STATUS DE COMPRAS

Criar:

Precisa comprar

Cotando

Comprado

Recebido

Cancelado

23. FINANCEIRO DAS COMPRAS

No topo mostrar:

Orçamento previsto

Valor já gasto

Valor restante

Exemplo:

Orçamento:
R$ 8.000

Gasto:
R$ 4.320

Restante:
R$ 3.680

Criar uma barra visual de utilização do orçamento.

24. PROGRAMAÇÃO

Criar página extremamente visual chamada:

PROGRAMAÇÃO

Será a timeline oficial do evento.

Exemplo:

17:00
Equipe chega

17:30
Teste de áudio

18:00
Briefing do Staff

18:30
Abertura das portas

19:00
Início oficial

19:05
Vídeo de abertura

19:10
Apresentador

19:15
Primeira palestra

20:00
Segunda palestra

20:45
Coffee Break

21:10
Retorno

22:00
Encerramento

25. ITEM DA PROGRAMAÇÃO

Cada etapa da programação deve conter:

Horário

Título

Descrição

Responsável

Duração

Local

Status

Observação

Permitir reorganizar horários e ordem.

Permitir DRAG AND DROP.

26. PALESTRANTES

Criar módulo:

PALESTRANTES

Cada palestrante deve possuir:

Foto

Nome

WhatsApp

Instagram

Tema

Título da palestra

Horário da palestra

Horário de chegada

Duração

Status

Observações

27. CHECKLIST DO PALESTRANTE

Cada palestrante deve possuir checklist:

Confirmado

Tema definido

Título definido

Apresentação recebida

Apresentação revisada

Foto recebida

Bio recebida

Música de entrada definida

Microfone definido

Teste realizado

Brinde separado

Água no palco

Transporte organizado

Hospedagem organizada

28. PROGRESSO DO PALESTRANTE

Exibir:

8 / 14 etapas concluídas

57%

Criar barra de progresso individual.

29. STAFF

Criar página:

STAFF

Cada membro terá:

Nome

Foto

WhatsApp

Área

Função

Responsável direto

Horário de chegada

Status

Observações

30. ÁREAS DO STAFF

Recepção

Credenciamento

Palco

Som

Iluminação

Mídia

Coffee Break

Segurança

Organização

Limpeza

Suporte

31. MÍDIA

Criar módulo:

MÍDIA

Separar em:

Storymaker

Videomaker

Fotógrafo

Social Media

32. CHECKLIST STORYMAKER

Criar checklist inicial:

Preparação

Bastidores

Equipe

Chegada dos convidados

Credenciamento

Ambiente cheio

Abertura

Cada palestrante

Reações da plateia

Frases fortes

Coffee Break

Networking

Bastidores

Encerramento

Depoimentos

Foto final

Permitir adicionar novas cenas.

33. VIDEOMAKER

Checklist:

Fachada

Local

Detalhes

Decoração

Público entrando

Close convidados

Palestrantes

Plateia

Aplausos

Networking

Brindes

Bastidores

Encerramento

34. CONTEÚDOS QUE DEVEM SER PRODUZIDOS

Criar seção:

ENTREGÁVEIS DE CONTEÚDO

Adicionar inicialmente:

Aftermovie oficial

Reel abertura

Reel palestrantes

Reel público

Reel bastidores

Reel encerramento

Depoimentos

Fotos oficiais

Banco de imagens

Conteúdo para próxima edição

Cada um deve possuir:

Responsável

Prazo

Status

35. ESTRUTURA

Criar página:

ESTRUTURA & TECNOLOGIA

Checklist:

Caixas de som

Mesa de áudio

Microfone principal

Microfone reserva

Microfone lapela

Telão

Projetor

Painel LED

Notebook principal

Notebook reserva

Passador de slides

HDMI

USB-C

Adaptadores

Extensões

Filtros de linha

Internet

Internet reserva

Iluminação de palco

Iluminação ambiente

Iluminação de mídia

36. CAMPO PLANO B

Cada equipamento crítico deve possuir:

Plano principal

Plano B

Responsável

Status do teste

Exemplo:

Microfone principal

Principal:
Microfone sem fio A

Plano B:
Microfone com fio

Teste:
Aprovado

37. EXPERIÊNCIA DO CONVIDADO

Criar módulo:

EXPERIÊNCIA

Checklist:

Confirmação da inscrição

Mensagem 1 dia antes

Localização

Estacionamento

Horário das portas

Recepção

Credenciamento

Staff identificado

Música ambiente

Local para fotos

Água

Coffee Break

Banheiros sinalizados

Brindes

Orientação

Encerramento

Pesquisa de satisfação

38. CONTINGÊNCIAS

Criar página:

PLANO DE CONTINGÊNCIA

Cards:

Microfone parar

Projetor parar

Internet cair

Palestrante atrasar

Palestrante faltar

Energia cair

Evento atrasar

Convidado passar mal

Problema com alimentação

Problema no credenciamento

39. CAMPOS DA CONTINGÊNCIA

Cada situação deve possuir:

Problema

Plano de ação

Responsável

WhatsApp

Plano B

Observação

Exemplo:

PROBLEMA:
Internet cair

AÇÃO:
Ativar roteador 5G reserva

RESPONSÁVEL:
Carlos

40. PÓS-EVENTO

Criar módulo:

PÓS-EVENTO

Checklist:

Fotos organizadas

Vídeos organizados

Aftermovie

Reels

Depoimentos

Mensagem de agradecimento

Pesquisa de satisfação

Publicações

Marcar participantes

Marcar palestrantes

Lista próxima edição

Reunião interna

Registro de problemas

Registro de melhorias

41. CAMPO DE APRENDIZADOS

Criar área:

APRENDIZADOS DA FORJA

Permitir registrar:

O que funcionou

O que não funcionou

O que melhorar

Ideias para próxima edição

42. BUSCA GLOBAL

Adicionar busca no topo do sistema.

Permitir pesquisar:

Tarefas

Responsáveis

Palestrantes

Compras

Staff

Itens

Programação

43. FILTROS

Todos os módulos devem possuir filtros.

Exemplo:

Por responsável

Por status

Por prazo

Por prioridade

Por categoria

44. NOTIFICAÇÕES INTERNAS

Criar uma central simples de notificações.

Exemplos:

Tarefa vence amanhã

Compra está atrasada

Palestrante ainda não confirmou

Responsável ainda não foi definido

45. MODAIS

Quando clicar:

Nova tarefa

Abrir modal lateral ou central premium.

Campos organizados.

Não abrir páginas novas desnecessariamente.

Usar drawers e modais para deixar a navegação rápida.

46. EDIÇÃO RÁPIDA

Sempre que possível permitir editar informações rapidamente.

Exemplo:

clicar em status

alterar diretamente.

clicar no responsável

selecionar outro.

clicar no prazo

abrir calendário.

47. CONFIRMAÇÕES

Antes de excluir algo:

mostrar confirmação.

Exemplo:

Excluir tarefa?

Esta ação não poderá ser desfeita.

Cancelar

Excluir

48. RESPONSIVIDADE

O sistema precisa funcionar perfeitamente:

Desktop

Notebook

Tablet

Celular

No mobile:

cards empilhados

sidebar vira menu

tabelas devem ter visual adaptado

priorizar toque

49. UX

A experiência precisa ser extremamente intuitiva.

Evitar excesso de menus.

Evitar excesso de informação na mesma tela.

Utilizar:

cards

tabs

accordions

badges

tooltips

modais

dropdowns

progress bars

checklists

50. EMPTY STATES

Criar empty states profissionais.

Exemplo:

Nenhuma tarefa cadastrada.

Organize a Forja adicionando sua primeira tarefa.

[+ Criar tarefa]

51. DADOS PERSISTENTES

Todas as informações precisam ser persistentes.

Utilizar banco de dados.

Criar estrutura preparada para Supabase.

Criar tabelas relacionadas para:

eventos

tarefas

responsáveis

compras

palestrantes

staff

programação

mídia

estrutura

contingências

pós-evento

52. AUTENTICAÇÃO

Criar login.

Tela simples:

FORJA

Event Command Center

E-mail

Senha

Entrar

Não precisa cadastro público.

O sistema será utilizado pela organização.

53. MULTIUSUÁRIO

Preparar arquitetura para múltiplos membros da equipe.

No futuro cada pessoa poderá ter seu próprio acesso.

Campos:

Nome

Email

Cargo

Permissão

54. PERMISSÕES FUTURAS

Preparar estrutura para:

Administrador

Gestor

Equipe

Visualizador

Administrador:
acesso completo.

Gestor:
gerencia áreas.

Equipe:
visualiza e atualiza suas tarefas.

Visualizador:
somente leitura.

55. CONFIGURAÇÕES DO EVENTO

Criar página:

CONFIGURAÇÕES

Campos:

Nome do evento

Logo

Data

Horário

Local

Endereço

Orçamento

Quantidade estimada de convidados

WhatsApp principal

Instagram

Observações

56. EVENTOS FUTUROS

Apesar da primeira versão ser dedicada à FORJA, criar banco de dados pensando em múltiplas edições futuras.

Exemplo:

A Forja 2026

A Forja 2027

A Forja — Edição Especial

Cada evento deve possuir dados independentes.

57. VISÃO DO DIA DO EVENTO

Criar um botão no Dashboard:

MODO EVENTO

Ao ativar:

mostrar interface extremamente simplificada focada na execução ao vivo.

Exibir somente:

Horário atual

Próxima atividade

Atividade seguinte

Responsável atual

Próximas tarefas

Alertas

Contatos rápidos

58. MODO EVENTO

Exemplo:

AGORA

19:15

PALESTRA — JOÃO SILVA

Tempo restante:
34 min

Responsável palco:
Carlos

PRÓXIMO

20:00

PALESTRA — MARCOS

ALERTAS

Coffee Break inicia em 45 minutos.

59. CONTATOS RÁPIDOS

Dentro do Modo Evento colocar botões:

Coordenação

Som

Iluminação

Palco

Recepção

Mídia

Coffee

Ao clicar:

abrir WhatsApp do responsável.

Essa função é extremamente importante.

60. CHECKLIST FINAL PRÉ-ABERTURA

Criar card no Dashboard chamado:

CHECKLIST DE ABERTURA

Exemplo:

Som testado

Microfones testados

Telão funcionando

Slides carregados

Iluminação pronta

Internet funcionando

Staff posicionado

Recepção pronta

Coffee organizado

Palestrantes presentes

Mídia posicionada

Portas liberadas

Mostrar:

10 / 12 concluídos

61. SAÚDE DO EVENTO

Criar um indicador automático:

SAÚDE DA FORJA

Exemplo:

Excelente
92%

Calcular baseado em:

tarefas atrasadas

tarefas concluídas

responsáveis definidos

compras realizadas

estrutura testada

palestrantes confirmados

Quanto maior a organização, melhor o indicador.

62. HOME VISUAL

A primeira impressão precisa ser extremamente premium.

No Dashboard colocar discretamente no fundo algum elemento gráfico abstrato relacionado a:

calor

metal

faísca

energia

Não utilizar imagens óbvias de fogo.

Pode ser um glow laranja muito sutil no background.

63. DETALHES VISUAIS

Cards:

border-radius entre 10px e 16px.

Bordas finas.

Sombras discretas.

Muito espaço interno.

Interface respirável.

Evitar grandes gradientes.

Não utilizar glassmorphism exagerado.

64. PERFORMANCE

Priorizar:

carregamento rápido

componentes reutilizáveis

código organizado

interface fluida

arquitetura escalável

65. COMPONENTES

Criar componentes reutilizáveis para:

StatusBadge

PriorityBadge

ProgressBar

PersonCard

TaskCard

ChecklistItem

EventTimelineItem

AlertCard

MetricCard

ResponsibleCard

PurchaseCard

SpeakerCard

StaffCard

66. EXPERIÊNCIA DE SOFTWARE

Quero que a sensação ao utilizar seja:

"Temos controle total sobre o evento."

A pessoa precisa abrir o sistema e rapidamente entender:

O que está acontecendo?

O que falta?

Quem é responsável?

O que está atrasado?

O que precisa ser comprado?

Qual é o próximo passo?

67. NÃO FAZER

Não criar aparência de landing page.

Não criar banners comerciais.

Não criar interface cheia de gradientes.

Não utilizar dezenas de cores.

Não criar menus confusos.

Não criar cards gigantes sem necessidade.

Não utilizar textos excessivamente grandes.

Não transformar a interface em algo gamer.

Não exagerar no conceito de fogo.

68. RESULTADO FINAL

O resultado deve parecer um produto SaaS premium de gerenciamento de eventos criado especificamente para A FORJA.

Deve combinar:

Linear
Notion
ClickUp
Monday

com identidade própria.

Prioridades absolutas:

Organização

Clareza

Velocidade

Controle

Experiência

Design premium

Fácil utilização

Responsividade

Construa primeiro toda a estrutura visual e arquitetura da aplicação.

Depois implemente funcionalidades e banco de dados de maneira modular.

Não simplifique os módulos descritos.

Quero uma aplicação completa de gerenciamento do evento A Forja.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aforja-eventflow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f24bda4-d4fd-4304-b733-6f10f325a2ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
