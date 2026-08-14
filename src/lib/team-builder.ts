import { type Responsible, RESPONSIBLE_SECTORS } from "./forja-data";

export interface EventProfile {
  attendeeCount: number;
  selectedOptions: string[];
  stages: number;
  speakers: number;
  registrationType: string;
  cateringType: string;
  livestreamDedicated: boolean;
  exhibitors: number;
  vipCount: number;
  layout: string;
  duration: string;
  venueProvidedTeams: string[];
}

export interface TeamRecommendation {
  id: string;
  name: string;
  description: string;
  leaderRole: string;
  memberRoles: { role: string; count: number }[];
  category: "essential" | "recommended" | "optional";
  isExternal?: boolean;
  isVenueProvided?: boolean;
}

export function generateTeamRecommendation(profile: EventProfile): TeamRecommendation[] {
  const teams: TeamRecommendation[] = [];
  const { 
    attendeeCount, 
    selectedOptions, 
    stages, 
    speakers, 
    registrationType, 
    cateringType,
    livestreamDedicated,
    exhibitors,
    vipCount,
    layout,
    duration,
    venueProvidedTeams
  } = profile;

  const hasOption = (opt: string) => selectedOptions.includes(opt);
  const isVenueProvided = (team: string) => venueProvidedTeams.includes(team);

  // 1. COORDENAÇÃO GERAL
  const coordApoioCount = attendeeCount > 300 || layout === "Vários ambientes" ? 2 : (attendeeCount > 100 ? 1 : 0);
  teams.push({
    id: "coord-geral",
    name: "Coordenação Geral",
    description: "Comando geral, tomada de decisão e coordenação de fornecedores.",
    leaderRole: "Diretor Geral do Evento",
    memberRoles: coordApoioCount > 0 ? [{ role: "Assistente de Produção Executiva", count: coordApoioCount }] : [],
    category: "essential"
  });

  // 2. PRODUÇÃO / OPERAÇÕES
  if (hasOption("Montagem e desmontagem") || attendeeCount > 100 || exhibitors > 0) {
    let prodMembers = 0;
    if (attendeeCount > 500) prodMembers = 4;
    else if (attendeeCount > 200) prodMembers = 2;
    else if (attendeeCount > 50) prodMembers = 1;

    if (exhibitors > 0) prodMembers += Math.ceil(exhibitors / 10);

    teams.push({
      id: "producao-operacoes",
      name: "Produção / Operações",
      description: "Logística, montagem, materiais e suporte operacional.",
      leaderRole: "Produtor Geral",
      memberRoles: [{ role: "Assistente de Produção", count: prodMembers }],
      category: "essential"
    });
  }

  // 3. RECEPÇÃO E CREDENCIAMENTO
  if (hasOption("Recepção") || hasOption("Credenciamento")) {
    let recepCount = 0;
    const isDigital = registrationType === "QR Code / digital";
    const isManual = registrationType === "Inscrição no local";

    if (attendeeCount <= 50) recepCount = 2;
    else if (attendeeCount <= 100) recepCount = 3;
    else if (attendeeCount <= 200) recepCount = 4;
    else recepCount = Math.ceil(attendeeCount / 50);

    if (isDigital) recepCount = Math.max(1, Math.floor(recepCount * 0.7));
    if (isManual) recepCount = Math.ceil(recepCount * 1.3);

    const isExternal = isVenueProvided("Recepção");

    teams.push({
      id: "recepcao-credenciamento",
      name: "Recepção e Credenciamento",
      description: "Check-in, entrega de kits e orientação inicial.",
      leaderRole: "Coordenador de Recepção",
      memberRoles: [{ role: "Staff de Check-in", count: recepCount }],
      category: "essential",
      isVenueProvided: isExternal
    });
  }

  // 4. STAFF / APOIO
  let staffCount = Math.ceil(attendeeCount / 40);
  if (layout === "Vários ambientes" || layout === "Evento externo") staffCount += 2;
  if (duration === "Dia inteiro" || duration === "Mais de um dia") staffCount = Math.ceil(staffCount * 1.2);

  teams.push({
    id: "staff-apoio",
    name: "Staff / Apoio",
    description: "Orientação de público, suporte aos ambientes e demandas rápidas.",
    leaderRole: "Coordenador de Staff",
    memberRoles: [{ role: "Staff de Apoio", count: staffCount }],
    category: "essential"
  });

  // 5. PALCO E BASTIDORES
  if (hasOption("Palco")) {
    const stageMembers = stages > 1 ? stages : (attendeeCount > 200 ? 1 : 0);
    teams.push({
      id: "palco-bastidores",
      name: "Palco e Bastidores",
      description: "Controle de horários, transições e suporte aos apresentadores.",
      leaderRole: "Stage Manager",
      memberRoles: stageMembers > 0 ? [{ role: "Assistente de Palco", count: stageMembers }] : [],
      category: "essential"
    });
  }

  // 6. PALESTRANTES / SPEAKER CARE
  if (hasOption("Palestrantes") && speakers > 3) {
    const speakerAssistants = Math.ceil(speakers / 8);
    teams.push({
      id: "palestrantes-care",
      name: "Palestrantes / Speaker Care",
      description: "Recepção, briefing e acompanhamento dos convidados.",
      leaderRole: "Speaker Manager",
      memberRoles: speakerAssistants > 0 ? [{ role: "Speaker Liaison", count: speakerAssistants }] : [],
      category: "recommended"
    });
  }

  // 7. SOM / ÁUDIO
  if (hasOption("Som")) {
    const isExternal = isVenueProvided("Som");
    const audioMembers = (stages > 1 || attendeeCount > 300) ? 1 : 0;
    teams.push({
      id: "som-audio",
      name: "Som / Áudio",
      description: "Operação de mesa, microfones e trilhas sonoras.",
      leaderRole: "Técnico de Som",
      memberRoles: audioMembers > 0 ? [{ role: "Microfonista", count: audioMembers }] : [],
      category: "essential",
      isVenueProvided: isExternal
    });
  }

  // 8. ILUMINAÇÃO
  if (hasOption("Iluminação")) {
    const isExternal = isVenueProvided("Iluminação");
    teams.push({
      id: "iluminacao",
      name: "Iluminação",
      description: "Iluminação técnica de palco e luz cênica de ambiente.",
      leaderRole: "Lighting Designer",
      memberRoles: [],
      category: "recommended",
      isVenueProvided: isExternal
    });
  }

  // 9. VÍDEO / PROJEÇÃO
  if (hasOption("Telão / Projeção")) {
    teams.push({
      id: "video-projecao",
      name: "Vídeo / Projeção",
      description: "Operação de slides, vídeos e conteúdo de tela.",
      leaderRole: "Operador de Vídeo",
      memberRoles: [],
      category: "essential"
    });
  }

  // 10. TRANSMISSÃO
  if (hasOption("Transmissão ao vivo")) {
    const transMembers = livestreamDedicated ? 2 : 1;
    teams.push({
      id: "transmissao",
      name: "Transmissão ao Vivo",
      description: "Direção de corte, streaming e monitoramento online.",
      leaderRole: "Diretor de Transmissão",
      memberRoles: [{ role: "Operador de Streaming", count: transMembers }],
      category: "recommended"
    });
  }

  // 11. MÍDIA / CONTEÚDO
  if (hasOption("Fotografia") || hasOption("Vídeo") || hasOption("Redes sociais / Stories")) {
    const mediaMembers: { role: string; count: number }[] = [];
    if (hasOption("Fotografia")) mediaMembers.push({ role: "Fotógrafo", count: attendeeCount > 500 ? 2 : 1 });
    if (hasOption("Vídeo")) mediaMembers.push({ role: "Videomaker", count: attendeeCount > 500 ? 2 : 1 });
    if (hasOption("Redes sociais / Stories")) mediaMembers.push({ role: "Storymaker", count: 1 });

    teams.push({
      id: "midia-conteudo",
      name: "Mídia / Conteúdo",
      description: "Cobertura fotográfica, vídeo e social media em tempo real.",
      leaderRole: "Diretor de Mídia",
      memberRoles: mediaMembers,
      category: "essential"
    });
  }

  // 12. HOSPITALIDADE / ALIMENTAÇÃO
  if (hasOption("Coffee break") || hasOption("Buffet / Refeição")) {
    const isExternal = isVenueProvided("Alimentação") || cateringType === "Fornecedor externo já possui equipe";
    let staffCount = 0;
    if (!isExternal) {
      if (cateringType === "Refeição sentada") staffCount = Math.ceil(attendeeCount / 12);
      else if (cateringType === "Buffet") staffCount = Math.ceil(attendeeCount / 25);
      else staffCount = Math.ceil(attendeeCount / 50);
    }

    teams.push({
      id: "hospitalidade",
      name: "Hospitalidade / A&B",
      description: "Gestão de buffet, coffee breaks e atendimento.",
      leaderRole: "Coordenador de A&B",
      memberRoles: staffCount > 0 ? [{ role: "Garçom / Copeiro", count: staffCount }] : [],
      category: "essential",
      isVenueProvided: isExternal,
      isExternal: isExternal
    });
  }

  // 13. BAR
  if (hasOption("Bar")) {
    const barCount = Math.ceil(attendeeCount / 60);
    teams.push({
      id: "bar",
      name: "Bar",
      description: "Serviço de bebidas e coquetelaria.",
      leaderRole: "Head Bartender",
      memberRoles: [{ role: "Bartender", count: barCount }],
      category: "optional"
    });
  }

  // 14. SEGURANÇA
  if (hasOption("Segurança") || attendeeCount > 100) {
    const isExternal = isVenueProvided("Segurança");
    let secCount = Math.ceil(attendeeCount / 50);
    if (hasOption("Bar")) secCount = Math.ceil(secCount * 1.2);
    if (layout === "Evento externo") secCount = Math.ceil(secCount * 1.3);

    teams.push({
      id: "seguranca",
      name: "Segurança",
      description: "Controle de acessos, perímetros e segurança do público.",
      leaderRole: "Coordenador de Segurança",
      memberRoles: [{ role: "Agente de Segurança", count: secCount }],
      category: "essential",
      isVenueProvided: isExternal
    });
  }

  // 15. LIMPEZA
  if (hasOption("Limpeza") || attendeeCount > 50) {
    const isExternal = isVenueProvided("Limpeza");
    let cleanCount = Math.ceil(attendeeCount / 75);
    if (hasOption("Coffee break") || hasOption("Buffet / Refeição")) cleanCount = Math.ceil(cleanCount * 1.2);

    teams.push({
      id: "limpeza",
      name: "Limpeza",
      description: "Manutenção de higiene dos ambientes e banheiros.",
      leaderRole: "Supervisor de Limpeza",
      memberRoles: [{ role: "Auxiliar de Limpeza", count: cleanCount }],
      category: "essential",
      isVenueProvided: isExternal
    });
  }

  // 16. EXPOSITORES
  if (hasOption("Expositores / Estandes") && exhibitors > 5) {
    teams.push({
      id: "expositores",
      name: "Relacionamento com Expositores",
      description: "Suporte, montagem e interface com marcas e estandes.",
      leaderRole: "Exhibitor Manager",
      memberRoles: exhibitors > 20 ? [{ role: "Assistente de Expositores", count: Math.ceil(exhibitors / 15) }] : [],
      category: "recommended"
    });
  }

  // 17. VIP
  if (hasOption("Área VIP") && vipCount > 0) {
    teams.push({
      id: "vip-care",
      name: "Hospitalidade VIP",
      description: "Atendimento exclusivo e acompanhamento de convidados especiais.",
      leaderRole: "Concierge VIP",
      memberRoles: [{ role: "Hostess VIP", count: Math.ceil(vipCount / 20) }],
      category: "recommended"
    });
  }

  // 18. ACESSIBILIDADE
  if (hasOption("Acessibilidade / apoio especial")) {
    teams.push({
      id: "acessibilidade",
      name: "Acessibilidade e Apoio",
      description: "Suporte especializado a participantes com necessidades específicas.",
      leaderRole: "Responsável por Acessibilidade",
      memberRoles: [],
      category: "optional"
    });
  }

  return teams;
}

export function convertRecommendationToResponsibles(teams: TeamRecommendation[]): Responsible[] {
  const responsibles: Responsible[] = [];
  let currentX = 0;
  let currentY = 0;
  const SECTOR_SPACING = 300;
  const PERSON_SPACING = 320;

  teams.forEach((team, teamIndex) => {
    const teamId = team.id;
    
    // Create Leader
    const leader: Responsible = {
      id: `r-${teamId}-leader`,
      area: team.name,
      description: team.description,
      name: null,
      role: team.leaderRole,
      whatsapp: "",
      status: "indefinido",
      notes: team.category === "essential" ? "Função essencial para o porte do evento." : "",
      sector: team.name,
      teamId: teamId,
      isLeader: true,
      position: { x: currentX, y: currentY },
      connections: []
    };
    responsibles.push(leader);

    // Create Members
    let memberX = currentX + PERSON_SPACING;
    team.memberRoles.forEach((roleGroup, groupIndex) => {
      for (let i = 0; i < roleGroup.count; i++) {
        const memberId = `r-${teamId}-member-${groupIndex}-${i}`;
        const member: Responsible = {
          id: memberId,
          area: team.name,
          description: null,
          name: null,
          role: roleGroup.role,
          whatsapp: "",
          status: "indefinido",
          notes: "",
          sector: team.name,
          teamId: teamId,
          isLeader: false,
          position: { x: memberX, y: currentY },
          connections: []
        };
        responsibles.push(member);
        
        // Connect to leader
        leader.connections?.push({ id: `e-${leader.id}-${memberId}`, target: memberId });
        
        memberX += PERSON_SPACING;
      }
    });

    currentY += SECTOR_SPACING;
  });

  return responsibles;
}
