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
  name: "",
  edition: "",
  date: "",
  doorsAt: "",
  venue: "",
  address: "",
  budget: 0,
  expectedGuests: 0,
  whatsapp: "",
  instagram: "",
  notes: "",
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

export const seedTasks: Task[] = [];

export interface Responsible {
  id: string;
  area: string;
  description?: string | null;
  name: string | null;
  role: string;
  whatsapp: string;
  status: PersonStatus;
  notes: string;
  sector?: string;
  parentId?: string | null; // Keep for legacy/main hierarchy but rely on connections for visuals
  position?: { x: number; y: number } | null;
  connections?: { id: string; target: string }[]; // New: list of child IDs
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

export const RESPONSIBLE_SECTORS = [
  "DIREÇÃO, GESTÃO E PRODUÇÃO EXECUTIVA",
  "PRODUÇÃO OPERACIONAL",
  "PLANEJAMENTO E CRONOGRAMA",
  "PALCO E PROGRAMAÇÃO",
  "APRESENTAÇÃO E CONDUÇÃO",
  "PALESTRANTES, CONVIDADOS E CONTEÚDO",
  "ÁUDIO",
  "ILUMINAÇÃO",
  "VÍDEO, TELÕES E PROJEÇÃO",
  "TRANSMISSÃO AO VIVO / BROADCAST",
  "CÂMERAS",
  "FOTOGRAFIA",
  "SOCIAL MEDIA E CONTEÚDO EM TEMPO REAL",
  "MARKETING DO EVENTO",
  "VENDAS E COMERCIAL",
  "PATROCÍNIOS",
  "PARCERIAS",
  "CREDENCIAMENTO",
  "RECEPÇÃO E HOSPITALIDADE",
  "FLUXO DE PÚBLICO",
  "ACESSO E CONTROLE",
  "SEGURANÇA PATRIMONIAL E DO PÚBLICO",
  "BRIGADA E INCÊNDIO",
  "SAÚDE E ATENDIMENTO MÉDICO",
  "GESTÃO DE CRISE",
  "INFRAESTRUTURA",
  "RIGGING E ESTRUTURAS TÉCNICAS",
  "ELÉTRICA E ENERGIA",
  "INTERNET, TI E TECNOLOGIA",
  "LOGÍSTICA",
  "ALMOXARIFADO E ESTOQUE",
  "TRANSPORTE",
  "ESTACIONAMENTO",
  "ALIMENTAÇÃO E BEBIDAS / A&B",
  "LIMPEZA",
  "RESÍDUOS E SUSTENTABILIDADE",
  "ACESSIBILIDADE",
  "VIP, AUTORIDADES E CONVIDADOS ESPECIAIS",
  "ARTISTAS E CAMARINS",
  "FIGURINO, MAQUIAGEM E BELEZA",
  "CENOGRAFIA E DECORAÇÃO",
  "BRANDING E SINALIZAÇÃO",
  "EXPERIÊNCIA DO PARTICIPANTE",
  "COMUNIDADE E NETWORKING",
  "ATIVAÇÕES E EXPERIÊNCIAS DE MARCA",
  "EXPOSITORES E FEIRA",
  "IMPRENSA E RELAÇÕES PÚBLICAS",
  "JURÍDICO E COMPLIANCE",
  "FINANCEIRO",
  "COMPRAS E SUPRIMENTOS",
  "FORNECEDORES",
  "RECURSOS HUMANOS E EQUIPE",
  "VOLUNTÁRIOS",
  "COMUNICAÇÃO INTERNA",
  "CENTRAL DE OPERAÇÕES",
  "LOCAL / VENUE",
  "HOSPEDAGEM",
  "VIAGENS",
  "PROTOCOLO E CERIMONIAL",
  "TRADUÇÃO E IDIOMAS",
  "EDUCAÇÃO, WORKSHOPS E SALAS PARALELAS",
  "EVENTOS ESPORTIVOS",
  "EVENTOS INFANTIS OU COM MENORES",
  "SEGURANÇA ALIMENTAR",
  "MANUTENÇÃO",
  "SANITÁRIOS E APOIO",
  "MERCHANDISING E LOJA",
  "BRINDES E KITS",
  "PESQUISA, DADOS E INTELIGÊNCIA",
  "PÓS-EVENTO",
  "Outro",
] as const;

export const seedResponsibles: Responsible[] = [];

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
  link?: string;
}

const PURCHASE_SEED: Array<[string, number, number, number | null, string | null, PurchaseStatus]> = [];

export const seedPurchases: Purchase[] = [];

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

const SCHEDULE_SEED: Array<[string, string, string, string, string, string]> = [];

export const seedSchedule: ScheduleItem[] = [];

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

export const seedSpeakers: Speaker[] = [];

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

const STAFF_SEED: Array<[string, string, string, string, string, PersonStatus]> = [];

export const seedStaff: StaffMember[] = [];

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

export const seedMediaChecklists: ChecklistGroup[] = [];

export interface Deliverable {
  id: string;
  title: string;
  owner: string | null;
  dueDate: string;
  status: TaskStatus;
}

export const seedDeliverables: Deliverable[] = [];

export interface Equipment {
  id: string;
  name: string;
  primary: string;
  backup: string;
  owner: string;
  test: "aprovado" | "pendente" | "reprovado";
  critical: boolean;
}

export const seedEquipment: Equipment[] = [];


export interface Contingency {
  id: string;
  problem: string;
  action: string;
  owner: string;
  whatsapp: string;
  planB: string;
  notes: string;
}

export const seedContingencies: Contingency[] = [];

export const seedPostEvent: ChecklistGroup = group(
  "pos-evento",
  "Checklist pós-evento",
  [],
  0,
);

export const seedOpeningChecklist: ChecklistGroup = group(
  "abertura",
  "Checklist de abertura",
  [],
  0,
);

export interface Learning {
  id: string;
  worked: string;
  failed: string;
  improve: string;
  nextEdition: string;
}

export const seedLearnings: Learning[] = [];

export const seedNotifications = [];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

export const whatsappLink = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;
