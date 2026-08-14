import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STATE_ID = "forja-principal";

export async function getAppStateServer() {
  const supabase = supabaseAdmin;

  // 1. Fetch main blob
  const { data: blob, error: blobError } = await supabase
    .from("forja_app_state")
    .select("*")
    .eq("id", STATE_ID)
    .single();

  if (blobError && blobError.code !== "PGRST116") {
    console.error("Error fetching app state blob:", blobError);
    throw blobError;
  }

  // 2. Fetch granular events
  const { data: events, error: eventsError } = await supabase
    .from("forja_events")
    .select("*");

  if (eventsError) {
    console.error("Error fetching granular events:", eventsError);
  }

  // 3. Fetch granular responsibles
  const { data: responsibles, error: respError } = await supabase
    .from("forja_responsibles")
    .select("*");

  if (respError) {
    console.error("Error fetching granular responsibles:", respError);
  }

  // If no blob exists yet, return null
  if (!blob) return null;

  const state = blob.state as any;

  // Merge granular data into the state
  if (events && events.length > 0) {
    state.events = events.map(e => ({
      id: e.id,
      name: e.name,
      date: e.date,
      venue: e.venue || "",
      createdAt: e.created_at
    }));

    events.forEach(e => {
      if (!state.eventData) state.eventData = {};
      if (!state.eventData[e.id]) {
        state.eventData[e.id] = {
          event: {
            name: e.name,
            edition: "",
            date: e.date,
            doorsAt: "",
            venue: e.venue || "",
            address: e.address || "",
            budget: Number(e.budget || 0),
            expectedGuests: e.expected_guests || 0,
            whatsapp: e.whatsapp || "",
            instagram: e.instagram || "",
            notes: e.notes || ""
          },
          responsibles: [],
          tasks: [],
          purchases: [],
          schedule: [],
          speakers: [],
          staff: [],
          media: [],
          deliverables: [],
          equipment: [],
          experience: { id: "experiencia", title: "Jornada do convidado", items: [] },
          contingencies: [],
          postEvent: { id: "pos-evento", title: "Checklist pós-evento", items: [] },
          opening: { id: "abertura", title: "Checklist de abertura", items: [] },
          learnings: [],
          preferredTeamView: "colunas"
        };
      } else {
        state.eventData[e.id].event = {
          ...state.eventData[e.id].event,
          name: e.name,
          date: e.date,
          venue: e.venue || "",
          address: e.address || "",
          budget: Number(e.budget || 0),
          expectedGuests: e.expected_guests || 0,
          whatsapp: e.whatsapp || "",
          instagram: e.instagram || "",
          notes: e.notes || ""
        };
      }
    });
  }

  if (responsibles) {
    responsibles.forEach(r => {
      if (state.eventData && state.eventData[r.event_id]) {
        const list = state.eventData[r.event_id].responsibles as any[];
        const index = list.findIndex(item => item.id === r.id);
        const mappedResp = {
          id: r.id,
          name: r.name,
          role: r.role,
          area: r.area,
          description: r.description,
          whatsapp: r.whatsapp,
          status: r.status,
          notes: r.notes,
          sector: r.sector,
          isLeader: r.is_leader,
          parentId: r.parent_id,
          position: { x: Number(r.position_x || 0), y: Number(r.position_y || 0) }
        };
        
        if (index >= 0) {
          list[index] = mappedResp;
        } else {
          list.push(mappedResp);
        }
      }
    });
  }

  return {
    ...blob,
    state
  };
}

export async function updateAppStateServer(state: any, revision: number) {
  const supabase = supabaseAdmin;

  const { data: current } = await supabase
    .from("forja_app_state")
    .select("revision")
    .eq("id", STATE_ID)
    .single();

  const nextRevision = (current?.revision || 0) + 1;

  if (state.events && Array.isArray(state.events)) {
    for (const e of state.events) {
      const meta = state.eventData?.[e.id]?.event;
      await supabase.from("forja_events").upsert({
        id: e.id,
        name: e.name,
        date: e.date,
        venue: e.venue,
        address: meta?.address,
        budget: meta?.budget,
        expected_guests: meta?.expectedGuests,
        whatsapp: meta?.whatsapp,
        instagram: meta?.instagram,
        notes: meta?.notes
      });

      const resps = state.eventData?.[e.id]?.responsibles;
      if (resps && Array.isArray(resps)) {
        for (const r of resps) {
          await supabase.from("forja_responsibles").upsert({
            id: r.id,
            event_id: e.id,
            name: r.name,
            role: r.role,
            area: r.area,
            description: r.description,
            whatsapp: r.whatsapp,
            status: r.status,
            notes: r.notes,
            sector: r.sector,
            is_leader: !!r.isLeader,
            parent_id: r.parentId,
            position_x: r.position?.x,
            position_y: r.position?.y
          });
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("forja_app_state")
    .upsert({
      id: STATE_ID,
      state,
      revision: nextRevision,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating app state:", error);
    throw error;
  }

  return data;
}


