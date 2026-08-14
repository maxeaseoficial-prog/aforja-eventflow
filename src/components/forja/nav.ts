import {
  Boxes,
  CalendarClock,
  Camera,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  Mic,
  Settings,
  ShoppingCart,
  Sparkles,
  UserCog,
  Users,
  Rotate3d,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  subtitle: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, subtitle: "Visão geral da organização da Forja." },
  { to: "/responsaveis", label: "Responsáveis", icon: UserCog, subtitle: "Quem responde por cada área do evento." },
  { to: "/tarefas", label: "Tarefas", icon: ClipboardList, subtitle: "Tudo que precisa ser executado." },
  { to: "/compras", label: "Compras", icon: ShoppingCart, subtitle: "Itens, fornecedores e orçamento." },
  { to: "/programacao", label: "Programação", icon: CalendarClock, subtitle: "Timeline oficial do evento." },
  { to: "/palestrantes", label: "Palestrantes", icon: Mic, subtitle: "Preparação individual de cada palestra." },
  { to: "/staff", label: "Staff", icon: Users, subtitle: "Equipe operacional e escalas." },
  { to: "/midia", label: "Mídia", icon: Camera, subtitle: "Captação, cenas e entregáveis." },
  
  
  { to: "/contingencias", label: "Contingências", icon: LifeBuoy, subtitle: "O que fazer quando algo falhar." },
  { to: "/pos-evento", label: "Pós-evento", icon: Rotate3d, subtitle: "Entregas, aprendizados e próxima edição." },
  { to: "/configuracoes", label: "Configurações", icon: Settings, subtitle: "Dados e parâmetros da edição." },
];

export const findNavItem = (pathname: string): NavItem => {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact;
  const partial = NAV_ITEMS.find((item) => item.to !== "/" && pathname.startsWith(item.to));
  return partial ?? NAV_ITEMS[0]!;
};
