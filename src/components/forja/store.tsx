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
    preferredTeamView?: "grid" | "organograma" | "lista" | "colunas";
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
  preferredTeamView: "grid" as "grid" | "organograma" | "lista" | "colunas",
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
  addResponsiblesBulk: (responsibles: Responsible[]) => void;
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
  updateEventData: (patch: any) => void;
  resetAll: () => void;
  updateResponsiblePosition: (id: string, position: { x: number; y: number }) => void;
  addConnection: (sourceId: string, targetId: string) => void;
  removeConnection: (edgeId: string) => void;
  updateConnection: (edgeId: string, newSourceId: string, newTargetId: string) => void;
  preferredTeamView?: "grid" | "organograma" | "lista" | "colunas";
  setPreferredTeamView: (view: "grid" | "organograma" | "lista" | "colunas") => void;
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
          const mergedState = { ...initialState, ...savedData };
          // Ensure events and eventData exist
          if (!mergedState.events) mergedState.events = [];
          if (!mergedState.eventData) mergedState.eventData = {};
          setState(mergedState);
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
        // First time syncing: try to push local state if it exists
        if (localState.events.length > 0) {
          try {
            const result = await updateAppState({ data: { state: localState, revision: 0 } });
            setCloudRevision(result.revision);
          } catch (e) {
            console.error("Failed to push initial local state:", e);
          }
        }
        setSyncStatus("synced");
        return;
      }
      const cloudState = cloudData.state as unknown as ForjaState;
      const cloudRev = cloudData.revision;
      
      // Critical: Ensure cloudState has the required structure before merging
      if (cloudState && Array.isArray(cloudState.events) && cloudState.events.length > 0) {
        setState(cloudState);
        setCloudRevision(cloudRev);
      } else if (localState.events && Array.isArray(localState.events) && localState.events.length > 0) {
        // If cloud is empty but local has data, try to push local
        const result = await updateAppState({ data: { state: localState, revision: cloudRev } });
        setCloudRevision(result.revision);
      }
      setSyncStatus("synced");
    } catch (err) {
      console.error("Sync error:", err);
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
    const currentData = state.currentEventId ? state.eventData[state.currentEventId] : null;
    const activeData = (currentData || emptyEventData()) as ReturnType<typeof emptyEventData>;


    const patchData = (patch: Partial<ReturnType<typeof emptyEventData>>) => {
      if (!state.currentEventId) return;
      setState((s) => {
        const currentEventData = s.eventData[s.currentEventId!] || emptyEventData();
        const updatedEventData = {
          ...currentEventData,
          ...patch,
        };
        return {
          ...s,
          eventData: {
            ...s.eventData,
            [s.currentEventId!]: updatedEventData as any,
          },
        };
      });
    };





    const patchList = <T extends { id: string }>(list: T[], id: string, patch: Partial<T>) =>
      list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));

    const toggleItems = (group: ChecklistGroup, itemId: string): ChecklistGroup => ({
      ...group,
      items: group.items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    });



    return {
      currentEventId: state.currentEventId,
      events: state.events || [],
      addEvent: (evt) => {
        const id = (evt as any).id || crypto.randomUUID();
        const entry: EventEntry = { ...evt, id, createdAt: new Date().toISOString() };
        
        setState((s) => {
          const currentEvents = Array.isArray(s.events) ? s.events : [];
          const currentEventData = s.eventData || {};
          
          return {
            ...s,
            events: [...currentEvents, entry],
            eventData: { 
              ...currentEventData, 
              [id]: emptyEventData() 
            },
          };
        });
      },
      selectEvent: (id) => setState((s) => ({ ...s, currentEventId: id })),
      removeEvent: (id) => setState((s) => {
        const { [id]: _, ...remainingData } = s.eventData;
        return {
          ...s,
          events: s.events.filter((e) => e.id !== id),
          eventData: remainingData,
          currentEventId: s.currentEventId === id ? null : s.currentEventId,
        };
      }),

      ...activeData,
      preferredTeamView: activeData.preferredTeamView,
      setPreferredTeamView: (view) => patchData({ preferredTeamView: view }),
      addTask: (task) => patchData({ tasks: [task, ...activeData.tasks] }),
      updateEvent: (patch) => {

        const id = state.currentEventId;
        if (!id) return;
        
        // Se mudou nome ou data, atualiza a lista de eventos também
        if (patch.name !== undefined || patch.date !== undefined) {
          setState(s => ({
            ...s,
            events: s.events.map(e => e.id === id ? {
              ...e,
              name: patch.name !== undefined ? patch.name : e.name,
              date: patch.date !== undefined ? patch.date : e.date,
            } : e)
          }));
        }

        patchData({ event: { ...activeData.event, ...patch } });
      },

      updateTask: (id, patch) => patchData({ tasks: patchList(activeData.tasks, id, patch) }),
      removeTask: (id) => patchData({ tasks: activeData.tasks.filter((t) => t.id !== id) }),
      moveTask: (id, status) => patchData({ tasks: patchList(activeData.tasks, id, { status }) }),
      updateResponsible: (id, patch) => patchData({ responsibles: patchList(activeData.responsibles, id, patch) }),
      addResponsible: (responsible) => {
        const others = activeData.responsibles;
        
        // Find existing responsibles in the same sector to avoid stacking
        const sameSector = others.filter(r => r.sector === responsible.sector);
        
        let x = 0;
        let y = 0;
        
        if (sameSector.length > 0) {
          // Find the rightmost node in this sector
          const maxX = Math.max(...sameSector.map(r => r.position?.x ?? 0));
          const sectorY = sameSector[0]?.position?.y ?? 0;
          x = maxX + 320;
          y = sectorY;
        } else if (others.length > 0) {
          // If it's a new sector, place it below the lowest existing node
          const maxY = Math.max(...others.map(r => r.position?.y ?? 0));
          x = 0;
          y = maxY + 250;
        }
        
        const newResponsible = {
          ...responsible,
          position: responsible.position && (responsible.position.x !== 0 || responsible.position.y !== 0) 
            ? responsible.position 
            : { x, y }
        };
        
        patchData({ responsibles: [...others, newResponsible] });
      },
      removeResponsible: (id) => patchData({ responsibles: activeData.responsibles.filter((r) => r.id !== id) }),
      addResponsiblesBulk: (list) => patchData({ responsibles: [...activeData.responsibles, ...list] }),
      updateEventData: (patch: any) => patchData(patch),
      updatePurchase: (id, patch) => patchData({ purchases: patchList(activeData.purchases, id, patch) }),
      addPurchase: (purchase) => patchData({ purchases: [purchase, ...activeData.purchases] }),
      removePurchase: (id) => patchData({ purchases: activeData.purchases.filter((p) => p.id !== id) }),
      addScheduleItem: (item) => patchData({ schedule: [...activeData.schedule, item] }),
      updateScheduleItem: (id, patch) => patchData({ schedule: patchList(activeData.schedule, id, patch) }),
      removeScheduleItem: (id) => patchData({ schedule: activeData.schedule.filter((item) => item.id !== id) }),
      reorderSchedule: (fromId, toId) => {
        const list = [...activeData.schedule];
        const from = list.findIndex((i) => i.id === fromId);
        const to = list.findIndex((i) => i.id === toId);
        if (from < 0 || to < 0 || from === to) return;
        const [moved] = list.splice(from, 1);
        if (!moved) return;
        list.splice(to, 0, moved);
        patchData({ schedule: list });
      },
      addSpeaker: (speaker) => patchData({ speakers: [...activeData.speakers, speaker] }),
      removeSpeaker: (id) => patchData({ speakers: activeData.speakers.filter((sp) => sp.id !== id) }),
      updateSpeaker: (id, patch) => patchData({ speakers: patchList(activeData.speakers, id, patch) }),
      toggleSpeakerStep: (id, index) => patchData({
        speakers: activeData.speakers.map((sp) =>
          sp.id === id ? { ...sp, checklist: sp.checklist.map((v, i) => (i === index ? !v : v)) } : sp
        ),
      }),
      addStaff: (member) => patchData({ staff: [...activeData.staff, member] }),
      removeStaff: (id) => patchData({ staff: activeData.staff.filter((m) => m.id !== id) }),
      updateStaff: (id, patch) => patchData({ staff: patchList(activeData.staff, id, patch) }),
      toggleGroupItem: (groupKey, itemId) => patchData({ [groupKey]: toggleItems(activeData[groupKey], itemId) }),
      toggleMediaItem: (groupId, itemId) => patchData({
        media: activeData.media.map((g) => (g.id === groupId ? toggleItems(g, itemId) : g)),
      }),
      addMediaDeliverable: (deliverable) => patchData({ deliverables: [...activeData.deliverables, deliverable] }),
      removeMediaDeliverable: (id) => patchData({ deliverables: activeData.deliverables.filter((d) => d.id !== id) }),
      updateMediaDeliverable: (id, patch) => patchData({ deliverables: patchList(activeData.deliverables, id, patch) }),
      updateEquipment: (id, patch) => patchData({ equipment: patchList(activeData.equipment, id, patch) }),
      updateContingency: (id, patch) => patchData({ contingencies: patchList(activeData.contingencies, id, patch) }),
      addContingency: (contingency) => patchData({ contingencies: [...activeData.contingencies, contingency] }),
      removeContingency: (id) => patchData({ contingencies: activeData.contingencies.filter((c) => c.id !== id) }),
      addLearning: (learning) => patchData({ learnings: [learning, ...activeData.learnings] }),
      
      clearTasks: () => patchData({ tasks: [] }),
      clearResponsibles: () => patchData({ responsibles: [] }),
      updateResponsiblePosition: (id, position) => patchData({
        responsibles: activeData.responsibles.map((r) => (r.id === id ? { ...r, position } : r)),
      }),
      addConnection: (sourceId, targetId) => patchData({
        responsibles: activeData.responsibles.map((r) => {
          if (r.id === sourceId) {
            const connections = r.connections || [];
            if (connections.some((c) => c.target === targetId)) return r;
            return { ...r, connections: [...connections, { id: `e-${sourceId}-${targetId}`, target: targetId }] };
          }
          return r;
        }),
      }),
      removeConnection: (edgeId) => patchData({
        responsibles: activeData.responsibles.map((r) => ({
          ...r,
          connections: (r.connections || []).filter((c) => c.id !== edgeId),
        })),
      }),
      updateConnection: (edgeId, newSourceId, newTargetId) => {
        const cleaned = activeData.responsibles.map((r) => ({
          ...r,
          connections: (r.connections || []).filter((c) => c.id !== edgeId),
        }));
        patchData({
          responsibles: cleaned.map((r) => {
            if (r.id === newSourceId) {
              const connections = r.connections || [];
              return { ...r, connections: [...connections, { id: edgeId, target: newTargetId }] };
            }
            return r;
          }),
        });
      },
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
    const done = tasks.filter((t) => t?.status === "concluido");
    const late = tasks.filter((t) => t?.status !== "concluido" && t?.dueDate && parse(t.dueDate) < today);
    const dueToday = tasks.filter((t) => t?.status !== "concluido" && t?.dueDate && parse(t.dueDate).toDateString() === new Date().toDateString());
    const pending = tasks.filter((t) => t?.status !== "concluido");
    const pendingPurchases = purchases.filter((p) => p?.status === "precisa-comprar" || p?.status === "cotando");
    const undefinedAreas = responsibles.filter((r) => !r?.name);
    const unconfirmedSpeakers = speakers.filter((s) => s?.status !== "confirmado");
    const purchasesWithoutOwner = purchases.filter((p) => !p?.owner && p?.status !== "cancelado");
    const spent = purchases.reduce((sum, p) => sum + (p?.actual ?? 0), 0);
    const estimated = purchases.reduce((sum, p) => sum + (p?.estimated ?? 0), 0);
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
