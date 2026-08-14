import { createContext, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { getAppState, updateAppState } from "@/lib/forja-sync.functions";
import { supabase } from "@/integrations/supabase/client";

import {
  eventConfig as seedEvent,
  seedContingencies,
  seedDeliverables,
  seedEquipment,
  seedLearnings,
  seedMediaChecklists,
  seedOpeningChecklist,
  seedPostEvent,
  seedPurchases,
  seedResponsibles,
  seedSchedule,
  seedSpeakers,
  seedStaff,
  seedTasks,
  type ChecklistGroup,
  type Contingency,
  type Deliverable,
  type Equipment,
  type EventConfig,
  type Learning,
  type Purchase,
  type Responsible,
  type ScheduleItem,
  type Speaker,
  type StaffMember,
  type Task,
  type TaskStatus,
} from "@/lib/forja-data";

interface EventEntry {
  id: string;
  name: string;
  date: string;
  venue: string;
  createdAt: string;
}

interface ForjaState {
  currentEventId: string | null;
  events: EventEntry[];
  eventData: Record<string, {
    event: EventConfig;
    tasks: Task[];
    responsibles: Responsible[];
    purchases: Purchase[];
    schedule: ScheduleItem[];
    speakers: Speaker[];
    staff: StaffMember[];
    media: ChecklistGroup[];
    deliverables: Deliverable[];
    equipment: Equipment[];
    experience: ChecklistGroup;
    contingencies: Contingency[];
    postEvent: ChecklistGroup;
    opening: ChecklistGroup;
    learnings: Learning[];
  }>;
}

const emptyEventData = () => ({
  event: seedEvent,
  tasks: seedTasks,
  responsibles: seedResponsibles,
  purchases: seedPurchases,
  schedule: seedSchedule,
  speakers: seedSpeakers,
  staff: seedStaff,
  media: seedMediaChecklists,
  deliverables: seedDeliverables,
  equipment: seedEquipment,
  experience: { id: "experiencia", title: "Jornada do convidado", items: [] },
  contingencies: seedContingencies,
  postEvent: seedPostEvent,
  opening: seedOpeningChecklist,
  learnings: seedLearnings,
});

const initialState: ForjaState = {
  currentEventId: null,
  events: [],
  eventData: {},
};

const STORAGE_KEY = "forja-command-center-v2";
const BACKUP_KEY = "forja-command-center-backup-before-cloud";
const LEGACY_STORAGE_KEY = "forja-command-center-v1";
const MIGRATION_KEY = "forja-clean-migration-v5";

export type SyncStatus = "synced" | "syncing" | "offline" | "error" | "initial";

interface ForjaContextValue {
  currentEventId: string | null;
  events: EventEntry[];
  addEvent: (event: Omit<EventEntry, "createdAt">) => void;
  selectEvent: (id: string | null) => void;
  removeEvent: (id: string) => void;
  
  // Scoped data accessors
  event: EventConfig;
  tasks: Task[];
  responsibles: Responsible[];
  purchases: Purchase[];
  schedule: ScheduleItem[];
  speakers: Speaker[];
  staff: StaffMember[];
  media: ChecklistGroup[];
  deliverables: Deliverable[];
  equipment: Equipment[];
  experience: ChecklistGroup;
  contingencies: Contingency[];
  postEvent: ChecklistGroup;
  opening: ChecklistGroup;
  learnings: Learning[];

  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  updateResponsible: (id: string, patch: Partial<Responsible>) => void;
  addResponsible: (responsible: Responsible) => void;
  removeResponsible: (id: string) => void;
  updatePurchase: (id: string, patch: Partial<Purchase>) => void;
  addPurchase: (purchase: Purchase) => void;
  removePurchase: (id: string) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (id: string, patch: Partial<ScheduleItem>) => void;
  removeScheduleItem: (id: string) => void;
  reorderSchedule: (fromId: string, toId: string) => void;
  addSpeaker: (speaker: Speaker) => void;
  removeSpeaker: (id: string) => void;
  updateSpeaker: (id: string, patch: Partial<Speaker>) => void;
  toggleSpeakerStep: (id: string, index: number) => void;
  addStaff: (member: StaffMember) => void;
  removeStaff: (id: string) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  toggleGroupItem: (groupKey: "experience" | "postEvent" | "opening", itemId: string) => void;
  toggleMediaItem: (groupId: string, itemId: string) => void;
  addMediaDeliverable: (deliverable: Deliverable) => void;
  removeMediaDeliverable: (id: string) => void;

  updateMediaDeliverable: (id: string, patch: Partial<Deliverable>) => void;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  updateContingency: (id: string, patch: Partial<Contingency>) => void;
  addContingency: (contingency: Contingency) => void;
  removeContingency: (id: string) => void;
  addLearning: (learning: Learning) => void;
  updateEvent: (patch: Partial<EventConfig>) => void;
  clearTasks: () => void;
  clearResponsibles: () => void;
  resetAll: () => void;
  updateResponsiblePosition: (id: string, position: { x: number; y: number }) => void;
  addConnection: (sourceId: string, targetId: string) => void;
  removeConnection: (edgeId: string) => void;
  updateConnection: (edgeId: string, newSourceId: string, newTargetId: string) => void;
  syncStatus: SyncStatus;
  cloudRevision: number;
  syncNow: () => Promise<void>;
}

const ForjaContext = createContext<ForjaContextValue | null>(null);

function migrateResponsiblesToMulti(list: Responsible[]): Responsible[] {
  const newList = list.map(r => ({ ...r, connections: r.connections || [] }));
  newList.forEach(child => {
    if (child.parentId) {
      const parent = newList.find(p => p.id === child.parentId);
      if (parent) {
        if (!parent.connections) parent.connections = [];
        const exists = parent.connections.some(c => c.target === child.id);
        if (!exists) {
          parent.connections.push({ id: `e-${parent.id}-${child.id}`, target: child.id });
        }
      }
    }
  });
  return newList;
}

export function ForjaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ForjaState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("initial");
  const [cloudRevision, setCloudRevision] = useState(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        if (!window.localStorage.getItem(BACKUP_KEY)) {
          window.localStorage.setItem(BACKUP_KEY, raw);
        }
        const savedData = JSON.parse(raw) as Partial<ForjaState>;
        // Data migration logic for multiple events structure
        if (savedData && !savedData.eventData && (savedData as any).tasks) {
          const oldData = savedData as any;
          const eventId = crypto.randomUUID();
          const eventEntry: EventEntry = {
            id: eventId,
            name: oldData.event?.name || "Evento Importado",
            date: oldData.event?.date || new Date().toISOString(),
            venue: oldData.event?.venue || "",
            createdAt: new Date().toISOString(),
          };
          setState({
            currentEventId: eventId,
            events: [eventEntry],
            eventData: {
              [eventId]: {
                event: oldData.event || seedEvent,
                tasks: oldData.tasks || seedTasks,
                responsibles: oldData.responsibles || seedResponsibles,
                purchases: oldData.purchases || seedPurchases,
                schedule: oldData.schedule || seedSchedule,
                speakers: oldData.speakers || seedSpeakers,
                staff: oldData.staff || seedStaff,
                media: oldData.media || seedMediaChecklists,
                deliverables: oldData.deliverables || seedDeliverables,
                equipment: oldData.equipment || seedEquipment,
                experience: oldData.experience || { id: "experiencia", title: "Jornada do convidado", items: [] },
                contingencies: oldData.contingencies || seedContingencies,
                postEvent: oldData.postEvent || seedPostEvent,
                opening: oldData.opening || seedOpeningChecklist,
                learnings: oldData.learnings || seedLearnings,
              }
            }
          });
        } else {
          setState({ ...initialState, ...savedData });
        }
      }
      setIsHydrated(true);
    } catch {
      setIsHydrated(true);
    }
  }, []);


  const syncWithCloud = async (localState: ForjaState) => {
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return;
    }
    try {
      setSyncStatus("syncing");
      const cloudData = await getAppState();
      if (!cloudData) {
        const result = await updateAppState({ data: { state: localState, revision: 0 } });
        setCloudRevision(result.revision);
        setSyncStatus("synced");
        return;
      }
      const cloudState = cloudData.state as unknown as ForjaState;
      const cloudRev = cloudData.revision;
      if (cloudRev > cloudRevision) {
        setState(cloudState);
        setCloudRevision(cloudRev);
      } else if (cloudRev === cloudRevision && isInitialLoad.current) {
         setCloudRevision(cloudRev);
      }
      setSyncStatus("synced");
    } catch (err) {
      setSyncStatus("error");
    } finally {
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    if (isHydrated) {
      syncWithCloud(state);
    }
  }, [isHydrated]);

  useEffect(() => {
    const channel = supabase
      .channel("forja-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "forja_app_state", filter: "id=eq.forja-principal" },
        (payload) => {
          const newData = payload.new as { state: ForjaState; revision: number };
          if (newData.revision > cloudRevision) {
            setState(newData.state);
            setCloudRevision(newData.revision);
            setSyncStatus("synced");
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cloudRevision]);

  useEffect(() => {
    if (!isHydrated || isInitialLoad.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!navigator.onLine) {
        setSyncStatus("offline");
        return;
      }
      try {
        setSyncStatus("syncing");
        const result = await updateAppState({ data: { state, revision: cloudRevision } });
        setCloudRevision(result.revision);
        setSyncStatus("synced");
      } catch (err) {
        setSyncStatus("error");
      }
    }, 1000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isHydrated, cloudRevision]);

  const value = useMemo<ForjaContextValue>(() => {
    const patchList = <T extends { id: string }>(list: T[], id: string, patch: Partial<T>) =>
      list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
    const toggleItems = (group: ChecklistGroup, itemId: string): ChecklistGroup => ({
      ...group,
      items: group.items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    });
    return {
      ...state,
      addTask: (task) => setState((s) => ({ ...s, tasks: [task, ...s.tasks] })),
      updateTask: (id, patch) => setState((s) => ({ ...s, tasks: patchList(s.tasks, id, patch) })),
      removeTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      moveTask: (id, status) => setState((s) => ({ ...s, tasks: patchList(s.tasks, id, { status }) })),
      updateResponsible: (id, patch) => setState((s) => ({ ...s, responsibles: patchList(s.responsibles, id, patch) })),
      addResponsible: (responsible) => setState((s) => ({ ...s, responsibles: [...s.responsibles, responsible] })),
      removeResponsible: (id) => setState((s) => ({ ...s, responsibles: s.responsibles.filter((r) => r.id !== id) })),
      updatePurchase: (id, patch) => setState((s) => ({ ...s, purchases: patchList(s.purchases, id, patch) })),
      addPurchase: (purchase) => setState((s) => ({ ...s, purchases: [purchase, ...s.purchases] })),
      removePurchase: (id) => setState((s) => ({ ...s, purchases: s.purchases.filter((p) => p.id !== id) })),
      addScheduleItem: (item) => setState((s) => ({ ...s, schedule: [...s.schedule, item] })),
      updateScheduleItem: (id, patch) => setState((s) => ({ ...s, schedule: patchList(s.schedule, id, patch) })),
      removeScheduleItem: (id) => setState((s) => ({ ...s, schedule: s.schedule.filter((item) => item.id !== id) })),
      reorderSchedule: (fromId, toId) => setState((s) => {
          const list = [...s.schedule];
          const from = list.findIndex((i) => i.id === fromId);
          const to = list.findIndex((i) => i.id === toId);
          if (from < 0 || to < 0 || from === to) return s;
          const [moved] = list.splice(from, 1);
          if (!moved) return s;
          list.splice(to, 0, moved);
          return { ...s, schedule: list };
      }),
      addSpeaker: (speaker) => setState((s) => ({ ...s, speakers: [...s.speakers, speaker] })),
      removeSpeaker: (id) => setState((s) => ({ ...s, speakers: s.speakers.filter((sp) => sp.id !== id) })),
      updateSpeaker: (id, patch) => setState((s) => ({ ...s, speakers: patchList(s.speakers, id, patch) })),
      toggleSpeakerStep: (id, index) => setState((s) => ({ ...s, speakers: s.speakers.map((sp) => sp.id === id ? { ...sp, checklist: sp.checklist.map((v, i) => (i === index ? !v : v)) } : sp) })),
      addStaff: (member) => setState((s) => ({ ...s, staff: [...s.staff, member] })),
      removeStaff: (id) => setState((s) => ({ ...s, staff: s.staff.filter((m) => m.id !== id) })),
      updateStaff: (id, patch) => setState((s) => ({ ...s, staff: patchList(s.staff, id, patch) })),
      toggleGroupItem: (groupKey: "experience" | "postEvent" | "opening", itemId: string) => setState((s) => ({ ...s, [groupKey]: toggleItems(s[groupKey], itemId) })),
      toggleMediaItem: (groupId: string, itemId: string) => setState((s) => ({ ...s, media: s.media.map((g) => (g.id === groupId ? toggleItems(g, itemId) : g)) })),
      addMediaDeliverable: (deliverable) => setState((s) => ({ ...s, deliverables: [...s.deliverables, deliverable] })),
      removeMediaDeliverable: (id) => setState((s) => ({ ...s, deliverables: s.deliverables.filter((d) => d.id !== id) })),
      updateMediaDeliverable: (id, patch) => setState((s) => ({ ...s, deliverables: patchList(s.deliverables, id, patch) })),
      updateEquipment: (id, patch) => setState((s) => ({ ...s, equipment: patchList(s.equipment, id, patch) })),
      updateContingency: (id, patch) => setState((s) => ({ ...s, contingencies: patchList(s.contingencies, id, patch) })),
      addContingency: (contingency) => setState((s) => ({ ...s, contingencies: [...s.contingencies, contingency] })),
      removeContingency: (id) => setState((s) => ({ ...s, contingencies: s.contingencies.filter((c) => c.id !== id) })),
      addLearning: (learning) => setState((s) => ({ ...s, learnings: [learning, ...s.learnings] })),
      updateEvent: (patch) => setState((s) => ({ ...s, event: { ...s.event, ...patch } })),
      clearTasks: () => setState((s) => ({ ...s, tasks: [] })),
      clearResponsibles: () => setState((s) => ({ ...s, responsibles: [] })),
      updateResponsiblePosition: (id, position) => setState((s) => ({ ...s, responsibles: s.responsibles.map((r) => r.id === id ? { ...r, position } : r) })),
      addConnection: (sourceId, targetId) => setState((s) => ({ ...s, responsibles: s.responsibles.map((r) => { if (r.id === sourceId) { const connections = r.connections || []; if (connections.some((c) => c.target === targetId)) return r; return { ...r, connections: [...connections, { id: `e-${sourceId}-${targetId}`, target: targetId }] }; } return r; }) })),
      removeConnection: (edgeId) => setState((s) => ({ ...s, responsibles: s.responsibles.map((r) => ({ ...r, connections: (r.connections || []).filter((c) => c.id !== edgeId) })) })),
      updateConnection: (edgeId, newSourceId, newTargetId) => setState((s) => { const cleaned = s.responsibles.map((r) => ({ ...r, connections: (r.connections || []).filter((c) => c.id !== edgeId) })); return { ...s, responsibles: cleaned.map((r) => { if (r.id === newSourceId) { const connections = r.connections || []; return { ...r, connections: [...connections, { id: edgeId, target: newTargetId }] }; } return r; }) }; }),
      resetAll: () => { toast.error("O reset global está desativado nesta versão em nuvem por segurança."); },
      syncStatus,
      cloudRevision,
      syncNow: () => syncWithCloud(state),
    };
  }, [state, syncStatus, cloudRevision]);

  return <ForjaContext.Provider value={value}>{children}</ForjaContext.Provider>;
}

export function useForja() {
  const ctx = useContext(ForjaContext);
  if (!ctx) throw new Error("useForja precisa estar dentro de ForjaProvider");
  return ctx;
}

export function useForjaMetrics() {
  const { tasks, purchases, responsibles, speakers, staff, equipment } = useForja();
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parse = (iso: string) => new Date(`${iso}T12:00:00`);
    const done = tasks.filter((t) => t.status === "concluido");
    const late = tasks.filter((t) => t.status !== "concluido" && parse(t.dueDate) < today);
    const dueToday = tasks.filter((t) => t.status !== "concluido" && parse(t.dueDate).toDateString() === new Date().toDateString());
    const pending = tasks.filter((t) => t.status !== "concluido");
    const pendingPurchases = purchases.filter((p) => p.status === "precisa-comprar" || p.status === "cotando");
    const undefinedAreas = responsibles.filter((r) => !r.name);
    const unconfirmedSpeakers = speakers.filter((s) => s.status !== "confirmado");
    const purchasesWithoutOwner = purchases.filter((p) => !p.owner && p.status !== "cancelado");
    const spent = purchases.reduce((sum, p) => sum + (p.actual ?? 0), 0);
    const estimated = purchases.reduce((sum, p) => sum + p.estimated, 0);
    const testedEquipment = equipment.filter((e) => e.test === "aprovado");
    const confirmedTeam = [...responsibles, ...staff].filter((p) => p.status === "confirmado");
    const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));
    const categories = [
      { label: "Equipe", value: pct(confirmedTeam.length, responsibles.length + staff.length) },
      { label: "Estrutura", value: pct(testedEquipment.length, equipment.length) },
      { label: "Mídia", value: pct(tasks.filter((t) => t.category === "Mídia" && t.status === "concluido").length, tasks.filter((t) => t.category === "Mídia").length) },
      { label: "Palestrantes", value: pct(speakers.reduce((sum, s) => sum + s.checklist.filter(Boolean).length, 0), speakers.length * 14) },
      { label: "Compras", value: pct(purchases.filter((p) => p.status === "comprado" || p.status === "recebido").length, purchases.length) },
      { label: "Programação", value: 0 },
    ];
    const health = Math.max(0, Math.min(100, Math.round(pct(done.length, tasks.length) * 0.3 + categories[0]!.value * 0.2 + categories[1]!.value * 0.2 + categories[4]!.value * 0.15 + categories[3]!.value * 0.15 - late.length * 2)));
    return {
      total: tasks.length,
      done: done.length,
      pending: pending.length,
      late,
      dueToday,
      pendingPurchases,
      purchasesWithoutOwner,
      undefinedAreas,
      unconfirmedSpeakers,
      teamSize: responsibles.filter((r) => r.name).length + staff.length,
      confirmedTeam: confirmedTeam.length,
      spent,
      estimated,
      progress: pct(done.length, tasks.length),
      categories,
      health,
    };
  }, [tasks, purchases, responsibles, speakers, staff, equipment]);
}
