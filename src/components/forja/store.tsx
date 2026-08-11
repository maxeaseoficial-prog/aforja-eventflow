import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  eventConfig as seedEvent,
  seedContingencies,
  seedDeliverables,
  seedEquipment,
  seedExperience,
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

interface ForjaState {
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
}

const initialState: ForjaState = {
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
  experience: seedExperience,
  contingencies: seedContingencies,
  postEvent: seedPostEvent,
  opening: seedOpeningChecklist,
  learnings: seedLearnings,
};

const STORAGE_KEY = "forja-command-center-v1";

interface ForjaContextValue extends ForjaState {
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
  updateScheduleItem: (id: string, patch: Partial<ScheduleItem>) => void;
  reorderSchedule: (fromId: string, toId: string) => void;
  updateSpeaker: (id: string, patch: Partial<Speaker>) => void;
  toggleSpeakerStep: (id: string, index: number) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  toggleGroupItem: (groupKey: "experience" | "postEvent" | "opening", itemId: string) => void;
  toggleMediaItem: (groupId: string, itemId: string) => void;
  updateDeliverable: (id: string, patch: Partial<Deliverable>) => void;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  updateContingency: (id: string, patch: Partial<Contingency>) => void;
  addLearning: (learning: Learning) => void;
    updateEvent: (patch: Partial<EventConfig>) => void;
    clearTasks: () => void;
    clearResponsibles: () => void;
    resetAll: () => void;
}

const ForjaContext = createContext<ForjaContextValue | null>(null);

export function ForjaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ForjaState>(initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<ForjaState>) });
    } catch {
      /* ignore corrupt cache */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

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
      updateResponsible: (id, patch) =>
        setState((s) => ({ ...s, responsibles: patchList(s.responsibles, id, patch) })),
      addResponsible: (responsible) =>
        setState((s) => ({ ...s, responsibles: [...s.responsibles, responsible] })),
      removeResponsible: (id) =>
        setState((s) => ({ ...s, responsibles: s.responsibles.filter((r) => r.id !== id) })),
      updatePurchase: (id, patch) =>
        setState((s) => ({ ...s, purchases: patchList(s.purchases, id, patch) })),
      addPurchase: (purchase) => setState((s) => ({ ...s, purchases: [purchase, ...s.purchases] })),
      removePurchase: (id) =>
        setState((s) => ({ ...s, purchases: s.purchases.filter((p) => p.id !== id) })),
      updateScheduleItem: (id, patch) =>
        setState((s) => ({ ...s, schedule: patchList(s.schedule, id, patch) })),
      reorderSchedule: (fromId, toId) =>
        setState((s) => {
          const list = [...s.schedule];
          const from = list.findIndex((i) => i.id === fromId);
          const to = list.findIndex((i) => i.id === toId);
          if (from < 0 || to < 0 || from === to) return s;
          const [moved] = list.splice(from, 1);
          if (!moved) return s;
          list.splice(to, 0, moved);
          return { ...s, schedule: list };
        }),
      updateSpeaker: (id, patch) =>
        setState((s) => ({ ...s, speakers: patchList(s.speakers, id, patch) })),
      toggleSpeakerStep: (id, index) =>
        setState((s) => ({
          ...s,
          speakers: s.speakers.map((sp) =>
            sp.id === id
              ? { ...sp, checklist: sp.checklist.map((v, i) => (i === index ? !v : v)) }
              : sp,
          ),
        })),
      updateStaff: (id, patch) => setState((s) => ({ ...s, staff: patchList(s.staff, id, patch) })),
      toggleGroupItem: (groupKey, itemId) =>
        setState((s) => ({ ...s, [groupKey]: toggleItems(s[groupKey], itemId) })),
      toggleMediaItem: (groupId, itemId) =>
        setState((s) => ({
          ...s,
          media: s.media.map((g) => (g.id === groupId ? toggleItems(g, itemId) : g)),
        })),
      updateDeliverable: (id, patch) =>
        setState((s) => ({ ...s, deliverables: patchList(s.deliverables, id, patch) })),
      updateEquipment: (id, patch) =>
        setState((s) => ({ ...s, equipment: patchList(s.equipment, id, patch) })),
      updateContingency: (id, patch) =>
        setState((s) => ({ ...s, contingencies: patchList(s.contingencies, id, patch) })),
      addLearning: (learning) => setState((s) => ({ ...s, learnings: [learning, ...s.learnings] })),
      updateEvent: (patch) => setState((s) => ({ ...s, event: { ...s.event, ...patch } })),
      clearTasks: () => setState((s) => ({ ...s, tasks: [] })),
      clearResponsibles: () => setState((s) => ({ ...s, responsibles: [] })),
      resetAll: () => setState(initialState),
    };
  }, [state]);

  return <ForjaContext.Provider value={value}>{children}</ForjaContext.Provider>;
}

export function useForja() {
  const ctx = useContext(ForjaContext);
  if (!ctx) throw new Error("useForja precisa estar dentro de ForjaProvider");
  return ctx;
}

/** Derived metrics used across dashboard and header. */
export function useForjaMetrics() {
  const { tasks, purchases, responsibles, speakers, staff, equipment } = useForja();

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parse = (iso: string) => new Date(`${iso}T12:00:00`);

    const done = tasks.filter((t) => t.status === "concluido");
    const late = tasks.filter((t) => t.status !== "concluido" && parse(t.dueDate) < today);
    const dueToday = tasks.filter(
      (t) => t.status !== "concluido" && parse(t.dueDate).toDateString() === new Date().toDateString(),
    );
    const pending = tasks.filter((t) => t.status !== "concluido");
    const pendingPurchases = purchases.filter(
      (p) => p.status === "precisa-comprar" || p.status === "cotando",
    );
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
      {
        label: "Mídia",
        value: pct(
          tasks.filter((t) => t.category === "Mídia" && t.status === "concluido").length || 2,
          Math.max(tasks.filter((t) => t.category === "Mídia").length, 3),
        ),
      },
      {
        label: "Palestrantes",
        value: pct(
          speakers.reduce((sum, s) => sum + s.checklist.filter(Boolean).length, 0),
          speakers.length * 14 || 1,
        ),
      },
      {
        label: "Compras",
        value: pct(
          purchases.filter((p) => p.status === "comprado" || p.status === "recebido").length,
          purchases.length,
        ),
      },
      { label: "Programação", value: 90 },
    ];

    const health = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          pct(done.length, tasks.length) * 0.3 +
            categories[0]!.value * 0.2 +
            categories[1]!.value * 0.2 +
            categories[4]!.value * 0.15 +
            categories[3]!.value * 0.15 -
            late.length * 2,
        ),
      ),
    );

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
