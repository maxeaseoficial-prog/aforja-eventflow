/**
 * FORJA — domain model + seed data.
 * Kept framework-agnostic so it can be swapped for database reads later.
 */

export type TaskStatus = "nao-iniciado" | "em-andamento" | "aguardando" | "concluido" | "problema";
export type Priority = "baixa" | "media" | "alta" | "urgente";
export type PurchaseStatus = "precisa-comprar" | "cotando" | "comprado" | "recebido" | "cancelado";
export type PersonStatus = "confirmado" | "pendente" | "indefinido";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  "nao-iniciado": "Não iniciado",
  "em-andamento": "Em andamento",
  aguardando: "Aguardando",
  concluido: "Concluído",
  problema: "Problema",
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  "nao-iniciado",
  "em-andamento",
  "aguardando",
  "concluido",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  "precisa-comprar": "Precisa comprar",
  cotando: "Cotando",
  comprado: "Comprado",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

export const TASK_CATEGORIES = [
  "Geral",
  "Mídia",
  "Som",
  "Iluminação",
  "Palestra",
  "Staff",
  "Compras",
  "Estrutura",
  "Recepção",
  "Coffee Break",
  "Programação",
  "Marketing",
  "Pós-evento",
] as const;

export interface EventConfig {
  name: string;
  edition: string;
  date: string; // ISO
  doorsAt: string;
  venue: string;
  address: string;
  budget: number;
  expectedGuests: number;
  whatsapp: string;
  instagram: string;
  notes: string;
}

export const eventConfig: EventConfig = {
  name: "A FORJA",
  edition: "Edição 2026",
  date: "2026-08-28T19:00:00-03:00",
  doorsAt: "18:30",
  venue: "Teatro Central — Guarapuava",
  address: "Rua XV de Novembro, 1200 — Centro",
  budget: 8000,
  expectedGuests: 240,
  whatsapp: "(42) 99999-0000",
  instagram: "@aforja",
  notes: "Evento de liderança e transformação. Foco em execução impecável.",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  ownerWhatsapp: string;
  createdAt: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  notes: string;
  checklist: { id: string; label: string; done: boolean }[];
}

const t = (
  id: string,
  title: string,
  category: string,
  owner: string,
  dueDate: string,
  priority: Priority,
  status: TaskStatus,
  description = "",
): Task => ({
  id,
  title,
  description,
  category,
  owner,
  ownerWhatsapp: "5542999990000",
  createdAt: "2026-07-14",
  dueDate,
  priority,
  status,
  notes: "",
  checklist: [],
});

export const seedTasks: Task[] = [
  t("t1", "Finalizar palestra de abertura", "Palestra", "Henrique", "2026-08-12", "alta", "em-andamento", "Roteiro + slides finais da abertura."),
  t("t2", "Fechar contrato de som", "Som", "João Silva", "2026-08-10", "urgente", "aguardando"),
  t("t3", "Definir roteiro do storymaker", "Mídia", "Bianca", "2026-08-08", "alta", "nao-iniciado"),
  t("t4", "Comprar crachás do staff", "Compras", "Marina", "2026-08-09", "media", "em-andamento"),
  t("t5", "Testar projetor e telão", "Estrutura", "Carlos", "2026-08-20", "alta", "nao-iniciado"),
  t("t6", "Briefing geral do staff", "Staff", "Marina", "2026-08-25", "media", "nao-iniciado"),
  t("t7", "Contratar coffee break", "Coffee Break", "Paula", "2026-08-14", "alta", "cotando" as unknown as TaskStatus),
  t("t8", "Fechar identidade visual dos reels", "Marketing", "Bianca", "2026-08-06", "media", "concluido"),
  t("t9", "Confirmar palestrante convidado", "Palestra", "Henrique", "2026-08-07", "urgente", "problema"),
  t("t10", "Montar planilha de credenciamento", "Recepção", "Letícia", "2026-08-18", "media", "em-andamento"),
  t("t11", "Definir música de entrada", "Som", "João Silva", "2026-08-22", "baixa", "nao-iniciado"),
  t("t12", "Organizar brindes dos palestrantes", "Compras", "Marina", "2026-08-19", "media", "concluido"),
  t("t13", "Revisar apresentações recebidas", "Palestra", "Henrique", "2026-08-24", "alta", "nao-iniciado"),
  t("t14", "Definir plano B de internet", "Estrutura", "Carlos", "2026-08-16", "urgente", "em-andamento"),
  t("t15", "Programar posts pré-evento", "Marketing", "Bianca", "2026-08-13", "media", "aguardando"),
  t("t16", "Fechar iluminação de palco", "Iluminação", "Rafael", "2026-08-11", "alta", "em-andamento"),
  t("t17", "Checklist de sinalização", "Estrutura", "Letícia", "2026-08-21", "baixa", "nao-iniciado"),
  t("t18", "Escala final do staff", "Staff", "Marina", "2026-08-23", "alta", "nao-iniciado"),
];
const coffeeTask = seedTasks.find((task) => task.id === "t7");
if (coffeeTask) coffeeTask.status = "em-andamento";

export interface Responsible {
  id: string;
  area: string;
  name: string | null;
  role: string;
  whatsapp: string;
  status: PersonStatus;
  notes: string;
}

const AREAS = [
  "Coordenação Geral",
  "Som",
  "Iluminação",
  "Telão / Projeção",
  "Equipe de Mídia",
  "Storymaker",
  "Recepção",
  "Credenciamento",
  "Coffee Break",
  "Palco / Bastidores",
  "Palestrantes",
  "Staff",
  "Segurança",
  "Limpeza",
  "Brindes",
  "Fotografia",
  "Videomaker",
];

const RESP_SEED: Array<[string, string | null, string, PersonStatus]> = [
  ["Coordenação Geral", "Henrique Alves", "Coordenador geral", "confirmado"],
  ["Som", "João Silva", "Técnico de áudio", "confirmado"],
  ["Iluminação", "Rafael Costa", "Operador de luz", "confirmado"],
  ["Telão / Projeção", "Carlos Mendes", "Operador de vídeo", "pendente"],
  ["Equipe de Mídia", "Bianca Rocha", "Coordenadora de mídia", "confirmado"],
  ["Storymaker", "Duda Lima", "Storymaker", "confirmado"],
  ["Recepção", "Letícia Souza", "Líder de recepção", "confirmado"],
  ["Credenciamento", "Letícia Souza", "Líder de credenciamento", "pendente"],
  ["Coffee Break", "Paula Neves", "Responsável coffee", "confirmado"],
  ["Palco / Bastidores", "Carlos Mendes", "Palco", "confirmado"],
  ["Palestrantes", "Henrique Alves", "Relacionamento", "confirmado"],
  ["Staff", "Marina Dias", "Coordenadora de staff", "confirmado"],
  ["Segurança", null, "—", "indefinido"],
  ["Limpeza", null, "—", "indefinido"],
  ["Brindes", "Marina Dias", "Brindes", "pendente"],
  ["Fotografia", "Tiago Prado", "Fotógrafo", "confirmado"],
  ["Videomaker", null, "—", "indefinido"],
];

export const seedResponsibles: Responsible[] = RESP_SEED.map(([area, name, role, status], i) => ({
  id: `r${i + 1}`,
  area,
  name,
  role,
  whatsapp: name ? `55429${(88800000 + i * 1234).toString()}` : "",
  status,
  notes: "",
}));

export const responsibleAreas = AREAS;

export interface Purchase {
  id: string;
  item: string;
  category: string;
  quantity: number;
  estimated: number;
  actual: number | null;
  owner: string | null;
  whatsapp: string;
  supplier: string;
  dueDate: string;
  status: PurchaseStatus;
  notes: string;
}

const PURCHASE_SEED: Array<[string, number, number, number | null, string | null, PurchaseStatus]> = [
  ["Crachás staff", 30, 210, 198, "Marina Dias", "comprado"],
  ["Crachás convidados", 240, 480, null, "Marina Dias", "cotando"],
  ["Cordões", 270, 405, 405, "Marina Dias", "recebido"],
  ["Pulseiras", 240, 180, null, null, "precisa-comprar"],
  ["Brindes palestrantes", 6, 900, 870, "Henrique Alves", "comprado"],
  ["Sacolas", 240, 720, null, null, "precisa-comprar"],
  ["Kits de boas-vindas", 240, 960, null, "Letícia Souza", "cotando"],
  ["Água (fardos)", 12, 180, 180, "Paula Neves", "recebido"],
  ["Café", 8, 320, 320, "Paula Neves", "comprado"],
  ["Copos", 500, 120, null, "Paula Neves", "precisa-comprar"],
  ["Guardanapos", 1000, 60, 58, "Paula Neves", "comprado"],
  ["Alimentos coffee", 1, 1400, null, "Paula Neves", "cotando"],
  ["Canetas", 240, 190, null, null, "precisa-comprar"],
  ["Cadernos", 240, 640, null, "Marina Dias", "cotando"],
  ["Fita adesiva", 10, 70, 66, "Carlos Mendes", "comprado"],
  ["Extensões", 8, 240, 240, "Carlos Mendes", "recebido"],
  ["Filtros de linha", 6, 210, null, "Carlos Mendes", "cotando"],
  ["Pilhas", 20, 120, 115, "João Silva", "comprado"],
  ["Cabos (HDMI/XLR)", 10, 350, null, "Carlos Mendes", "precisa-comprar"],
  ["Materiais de sinalização", 15, 300, null, "Letícia Souza", "cotando"],
  ["Decoração", 1, 800, null, null, "precisa-comprar"],
  ["Carregadores", 4, 160, 152, "Bianca Rocha", "comprado"],
  ["Power banks", 3, 270, null, "Bianca Rocha", "cotando"],
  ["Adaptadores USB-C / HDMI", 5, 250, 244, "Carlos Mendes", "comprado"],
  ["Primeiros socorros", 1, 180, null, null, "precisa-comprar"],
];

export const seedPurchases: Purchase[] = PURCHASE_SEED.map(
  ([item, quantity, estimated, actual, owner, status], i) => ({
    id: `p${i + 1}`,
    item,
    category: item.split(" ")[0] ?? item,
    quantity,
    estimated,
    actual,
    owner,
    whatsapp: owner ? "5542999990000" : "",
    supplier: status === "precisa-comprar" ? "" : "Fornecedor local",
    dueDate: `2026-08-${String(8 + (i % 18)).padStart(2, "0")}`,
    status,
    notes: "",
  }),
);

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  owner: string;
  duration: string;
  place: string;
  status: TaskStatus;
  notes: string;
}

const SCHEDULE_SEED: Array<[string, string, string, string, string, string]> = [
  ["17:00", "Equipe chega", "Chegada de toda a equipe e conferência inicial", "Marina Dias", "30 min", "Hall"],
  ["17:30", "Teste de áudio", "Microfones, caixas e mesa", "João Silva", "30 min", "Palco"],
  ["18:00", "Briefing do Staff", "Alinhamento de funções e posições", "Marina Dias", "30 min", "Foyer"],
  ["18:30", "Abertura das portas", "Recepção e credenciamento ativos", "Letícia Souza", "30 min", "Entrada"],
  ["19:00", "Início oficial", "Boas-vindas", "Henrique Alves", "5 min", "Palco"],
  ["19:05", "Vídeo de abertura", "Aftermovie teaser", "Bianca Rocha", "5 min", "Telão"],
  ["19:10", "Apresentador", "Condução do evento", "Henrique Alves", "5 min", "Palco"],
  ["19:15", "Primeira palestra", "João Silva — Forjando Liderança", "Carlos Mendes", "45 min", "Palco"],
  ["20:00", "Segunda palestra", "Marcos Vieira — Pressão e Performance", "Carlos Mendes", "45 min", "Palco"],
  ["20:45", "Coffee Break", "Networking e coffee", "Paula Neves", "25 min", "Foyer"],
  ["21:10", "Retorno", "Retomada da programação", "Henrique Alves", "50 min", "Palco"],
  ["22:00", "Encerramento", "Agradecimentos e foto final", "Henrique Alves", "20 min", "Palco"],
];

export const seedSchedule: ScheduleItem[] = SCHEDULE_SEED.map(
  ([time, title, description, owner, duration, place], i) => ({
  id: `s${i + 1}`,
  time,
  title,
  description,
  owner,
  duration,
  place,
  status: i < 3 ? "concluido" : ("nao-iniciado" as TaskStatus),
  notes: "",
}));

export const SPEAKER_CHECKLIST = [
  "Confirmado",
  "Tema definido",
  "Título definido",
  "Apresentação recebida",
  "Apresentação revisada",
  "Foto recebida",
  "Bio recebida",
  "Música de entrada definida",
  "Microfone definido",
  "Teste realizado",
  "Brinde separado",
  "Água no palco",
  "Transporte organizado",
  "Hospedagem organizada",
];

export interface Speaker {
  id: string;
  name: string;
  whatsapp: string;
  instagram: string;
  theme: string;
  talkTitle: string;
  talkTime: string;
  arrival: string;
  duration: string;
  status: PersonStatus;
  notes: string;
  checklist: boolean[];
}

const speaker = (
  id: string,
  name: string,
  theme: string,
  talkTitle: string,
  talkTime: string,
  arrival: string,
  status: PersonStatus,
  done: number,
): Speaker => ({
  id,
  name,
  whatsapp: "5542999990000",
  instagram: "@" + name.toLowerCase().split(" ")[0],
  theme,
  talkTitle,
  talkTime,
  arrival,
  duration: "45 min",
  status,
  notes: "",
  checklist: SPEAKER_CHECKLIST.map((_, i) => i < done),
});

export const seedSpeakers: Speaker[] = [
  speaker("sp1", "João Silva", "Liderança", "Forjando Liderança", "19:15", "18:15", "confirmado", 11),
  speaker("sp2", "Marcos Vieira", "Performance", "Pressão e Performance", "20:00", "18:45", "confirmado", 8),
  speaker("sp3", "Ana Prado", "Transformação", "O Metal e o Fogo", "21:10", "19:30", "pendente", 5),
];

export interface StaffMember {
  id: string;
  name: string;
  whatsapp: string;
  area: string;
  role: string;
  reportsTo: string;
  arrival: string;
  status: PersonStatus;
  notes: string;
}

export const STAFF_AREAS = [
  "Recepção",
  "Credenciamento",
  "Palco",
  "Som",
  "Iluminação",
  "Mídia",
  "Coffee Break",
  "Segurança",
  "Organização",
  "Limpeza",
  "Suporte",
];

const STAFF_SEED: Array<[string, string, string, string, string, PersonStatus]> = [
  ["Camila Ruiz", "Recepção", "Recepcionista", "Letícia Souza", "17:30", "confirmado"],
  ["Diego Matos", "Credenciamento", "Operador", "Letícia Souza", "17:30", "confirmado"],
  ["Fernanda Lopes", "Credenciamento", "Operadora", "Letícia Souza", "17:30", "pendente"],
  ["Gustavo Reis", "Palco", "Assistente de palco", "Carlos Mendes", "17:00", "confirmado"],
  ["Helena Braga", "Mídia", "Assistente de mídia", "Bianca Rocha", "17:00", "confirmado"],
  ["Igor Santana", "Som", "Assistente de áudio", "João Silva", "17:00", "confirmado"],
  ["Júlia Freitas", "Coffee Break", "Apoio coffee", "Paula Neves", "19:30", "pendente"],
  ["Kaio Barros", "Segurança", "Portaria", "—", "17:30", "indefinido"],
  ["Lara Antunes", "Organização", "Apoio geral", "Marina Dias", "17:00", "confirmado"],
  ["Mateus Vidal", "Limpeza", "Apoio", "—", "22:00", "indefinido"],
  ["Nina Coelho", "Suporte", "Volante", "Marina Dias", "17:30", "confirmado"],
  ["Otávio Lins", "Iluminação", "Assistente de luz", "Rafael Costa", "17:00", "confirmado"],
];

export const seedStaff: StaffMember[] = STAFF_SEED.map(
  ([name, area, role, reportsTo, arrival, status], i) => ({
  id: `st${i + 1}`,
  name,
  whatsapp: "5542999990000",
  area,
  role,
  reportsTo,
  arrival,
  status: status as PersonStatus,
  notes: "",
}));

export interface ChecklistGroup {
  id: string;
  title: string;
  subtitle?: string | undefined;
  items: { id: string; label: string; done: boolean }[];
}

const group = (id: string, title: string, labels: string[], doneCount = 0, subtitle?: string): ChecklistGroup => ({
  id,
  title,
  subtitle,
  items: labels.map((label, i) => ({ id: `${id}-${i}`, label, done: i < doneCount })),
});

export const seedMediaChecklists: ChecklistGroup[] = [
  group(
    "storymaker",
    "Storymaker",
    [
      "Preparação",
      "Bastidores",
      "Equipe",
      "Chegada dos convidados",
      "Credenciamento",
      "Ambiente cheio",
      "Abertura",
      "Cada palestrante",
      "Reações da plateia",
      "Frases fortes",
      "Coffee Break",
      "Networking",
      "Bastidores (final)",
      "Encerramento",
      "Depoimentos",
      "Foto final",
    ],
    4,
    "Cenas obrigatórias em tempo real",
  ),
  group(
    "videomaker",
    "Videomaker",
    [
      "Fachada",
      "Local",
      "Detalhes",
      "Decoração",
      "Público entrando",
      "Close convidados",
      "Palestrantes",
      "Plateia",
      "Aplausos",
      "Networking",
      "Brindes",
      "Bastidores",
      "Encerramento",
    ],
    3,
    "Planos de captação",
  ),
  group("fotografo", "Fotógrafo", ["Retratos palestrantes", "Plateia", "Equipe", "Detalhes", "Foto oficial", "Bastidores"], 2),
  group("social", "Social Media", ["Stories ao vivo", "Repost convidados", "Post agradecimento", "Cobertura tempo real"], 1),
];

export interface Deliverable {
  id: string;
  title: string;
  owner: string | null;
  dueDate: string;
  status: TaskStatus;
}

export const seedDeliverables: Deliverable[] = [
  ["Aftermovie oficial", "Bianca Rocha", "2026-09-10", "nao-iniciado"],
  ["Reel abertura", "Duda Lima", "2026-09-01", "nao-iniciado"],
  ["Reel palestrantes", "Duda Lima", "2026-09-03", "nao-iniciado"],
  ["Reel público", "Duda Lima", "2026-09-04", "nao-iniciado"],
  ["Reel bastidores", "Duda Lima", "2026-09-05", "nao-iniciado"],
  ["Reel encerramento", "Bianca Rocha", "2026-09-06", "nao-iniciado"],
  ["Depoimentos", "Tiago Prado", "2026-09-02", "nao-iniciado"],
  ["Fotos oficiais", "Tiago Prado", "2026-08-31", "em-andamento"],
  ["Banco de imagens", "Tiago Prado", "2026-09-12", "nao-iniciado"],
  ["Conteúdo próxima edição", null, "2026-09-20", "nao-iniciado"],
].map(([title, owner, dueDate, status], i) => ({
  id: `d${i + 1}`,
  title: title as string,
  owner: owner as string | null,
  dueDate: dueDate as string,
  status: status as TaskStatus,
}));

export interface Equipment {
  id: string;
  name: string;
  primary: string;
  backup: string;
  owner: string;
  test: "aprovado" | "pendente" | "reprovado";
  critical: boolean;
}

export const seedEquipment: Equipment[] = [
  ["Caixas de som", "PA principal 2x", "Caixa ativa reserva", "João Silva", "aprovado", true],
  ["Mesa de áudio", "Mesa digital 16ch", "Mesa analógica 8ch", "João Silva", "aprovado", true],
  ["Microfone principal", "Microfone sem fio A", "Microfone com fio", "João Silva", "aprovado", true],
  ["Microfone reserva", "Sem fio B", "Com fio XLR 10m", "João Silva", "pendente", true],
  ["Microfone lapela", "Lapela sem fio", "Headset", "João Silva", "pendente", false],
  ["Telão", "Tela 4x3m", "Painel LED", "Carlos Mendes", "pendente", true],
  ["Projetor", "Projetor 6000 lumens", "Projetor 3500 lumens", "Carlos Mendes", "aprovado", true],
  ["Painel LED", "Painel 3x2m", "Telão + projetor", "Carlos Mendes", "pendente", false],
  ["Notebook principal", "MacBook apresentação", "Notebook Windows", "Bianca Rocha", "aprovado", true],
  ["Notebook reserva", "Notebook Windows", "Tablet + HDMI", "Bianca Rocha", "pendente", false],
  ["Passador de slides", "Apresentador wireless", "Operador manual", "Carlos Mendes", "aprovado", false],
  ["Cabo HDMI", "HDMI 10m", "HDMI 5m + extensor", "Carlos Mendes", "aprovado", false],
  ["Adaptador USB-C", "Hub USB-C", "Adaptador simples", "Carlos Mendes", "aprovado", false],
  ["Extensões", "4x 10m", "2x 5m", "Carlos Mendes", "aprovado", false],
  ["Filtros de linha", "3 filtros", "Réguas simples", "Carlos Mendes", "pendente", false],
  ["Internet", "Fibra do local", "Roteador 5G", "Carlos Mendes", "pendente", true],
  ["Internet reserva", "Roteador 5G", "Hotspot celular", "Carlos Mendes", "reprovado", true],
  ["Iluminação de palco", "Par LED 6x", "Refletores fixos", "Rafael Costa", "aprovado", true],
  ["Iluminação ambiente", "Luz âmbar warm", "Luz do local", "Rafael Costa", "aprovado", false],
  ["Iluminação de mídia", "Softbox 2x", "Luz de LED portátil", "Rafael Costa", "pendente", false],
].map(([name, primary, backup, owner, test, critical], i) => ({
  id: `eq${i + 1}`,
  name: name as string,
  primary: primary as string,
  backup: backup as string,
  owner: owner as string,
  test: test as Equipment["test"],
  critical: critical as boolean,
}));

export const seedExperience: ChecklistGroup = group(
  "experiencia",
  "Jornada do convidado",
  [
    "Confirmação da inscrição",
    "Mensagem 1 dia antes",
    "Localização enviada",
    "Estacionamento orientado",
    "Horário das portas comunicado",
    "Recepção preparada",
    "Credenciamento fluido",
    "Staff identificado",
    "Música ambiente",
    "Local para fotos",
    "Água disponível",
    "Coffee Break",
    "Banheiros sinalizados",
    "Brindes entregues",
    "Orientação durante o evento",
    "Encerramento conduzido",
    "Pesquisa de satisfação",
  ],
  8,
  "Cada ponto de contato do convidado com A Forja",
);

export interface Contingency {
  id: string;
  problem: string;
  action: string;
  owner: string;
  whatsapp: string;
  planB: string;
  notes: string;
}

const CONTINGENCY_SEED: Array<[string, string, string, string]> = [
  ["Microfone parar", "Trocar imediatamente pelo microfone reserva", "João Silva", "Microfone com fio no palco"],
  ["Projetor parar", "Alternar saída para painel LED", "Carlos Mendes", "Palestra sem slides + narração"],
  ["Internet cair", "Ativar roteador 5G reserva", "Carlos Mendes", "Hotspot do celular da coordenação"],
  ["Palestrante atrasar", "Antecipar próxima palestra", "Henrique Alves", "Bloco de networking guiado"],
  ["Palestrante faltar", "Ativar palestrante reserva", "Henrique Alves", "Painel com mediador"],
  ["Energia cair", "Acionar equipe do local e gerador", "Carlos Mendes", "Iluminação de emergência + som portátil"],
  ["Evento atrasar", "Reduzir intervalos e blocos", "Marina Dias", "Cortar 10 min do coffee"],
  ["Convidado passar mal", "Acionar primeiros socorros", "Marina Dias", "Contato SAMU + sala reservada"],
  ["Problema com alimentação", "Contato imediato com fornecedor", "Paula Neves", "Compra emergencial local"],
  ["Problema no credenciamento", "Passar para lista manual impressa", "Letícia Souza", "Entrada por confirmação no celular"],
];

export const seedContingencies: Contingency[] = CONTINGENCY_SEED.map(
  ([problem, action, owner, planB], i) => ({
  id: `c${i + 1}`,
  problem,
  action,
  owner,
  whatsapp: "5542999990000",
  planB,
  notes: "",
}));

export const seedPostEvent: ChecklistGroup = group(
  "pos-evento",
  "Checklist pós-evento",
  [
    "Fotos organizadas",
    "Vídeos organizados",
    "Aftermovie",
    "Reels",
    "Depoimentos",
    "Mensagem de agradecimento",
    "Pesquisa de satisfação",
    "Publicações",
    "Marcar participantes",
    "Marcar palestrantes",
    "Lista próxima edição",
    "Reunião interna",
    "Registro de problemas",
    "Registro de melhorias",
  ],
  0,
);

export const seedOpeningChecklist: ChecklistGroup = group(
  "abertura",
  "Checklist de abertura",
  [
    "Som testado",
    "Microfones testados",
    "Telão funcionando",
    "Slides carregados",
    "Iluminação pronta",
    "Internet funcionando",
    "Staff posicionado",
    "Recepção pronta",
    "Coffee organizado",
    "Palestrantes presentes",
    "Mídia posicionada",
    "Portas liberadas",
  ],
  10,
);

export interface Learning {
  id: string;
  worked: string;
  failed: string;
  improve: string;
  nextEdition: string;
}

export const seedLearnings: Learning[] = [];

export const seedNotifications = [
  { id: "n1", text: "4 tarefas vencem hoje", tone: "warning" as const },
  { id: "n2", text: "Compra 'Sacolas' está atrasada", tone: "destructive" as const },
  { id: "n3", text: "Ana Prado ainda não confirmou", tone: "warning" as const },
  { id: "n4", text: "3 áreas sem responsável definido", tone: "destructive" as const },
];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

export const whatsappLink = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;
