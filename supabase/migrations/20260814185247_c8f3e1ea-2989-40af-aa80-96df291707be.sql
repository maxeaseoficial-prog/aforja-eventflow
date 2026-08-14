DO $$
DECLARE
    state_json JSONB;
    event_item JSONB;
    resp_item JSONB;
    v_event_id UUID;
BEGIN
    SELECT state INTO state_json FROM public.forja_app_state WHERE id = 'forja-principal';
    
    IF state_json IS NOT NULL THEN
        FOR event_item IN SELECT * FROM jsonb_array_elements(state_json->'events') LOOP
            INSERT INTO public.forja_events (id, name, date, venue)
            VALUES (
                (event_item->>'id')::UUID,
                event_item->>'name',
                (event_item->>'date')::TIMESTAMPTZ,
                event_item->>'venue'
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                date = EXCLUDED.date,
                venue = EXCLUDED.venue
            RETURNING id INTO v_event_id;
            
            DECLARE
                v_data JSONB;
            BEGIN
                v_data := state_json->'eventData'->(event_item->>'id');
                IF v_data IS NOT NULL THEN
                    UPDATE public.forja_events SET
                        address = v_data->'event'->>'address',
                        budget = COALESCE((v_data->'event'->>'budget')::NUMERIC, 0),
                        expected_guests = COALESCE((v_data->'event'->>'expectedGuests')::INTEGER, 0),
                        whatsapp = v_data->'event'->>'whatsapp',
                        instagram = v_data->'event'->>'instagram',
                        notes = v_data->'event'->>'notes'
                    WHERE id = v_event_id;
                    
                    IF v_data->'responsibles' IS NOT NULL AND jsonb_array_length(v_data->'responsibles') > 0 THEN
                        FOR resp_item IN SELECT * FROM jsonb_array_elements(v_data->'responsibles') LOOP
                            INSERT INTO public.forja_responsibles (
                                id, event_id, name, role, area, description, whatsapp, status, notes, sector, is_leader, position_x, position_y, parent_id
                            )
                            VALUES (
                                resp_item->>'id',
                                v_event_id,
                                resp_item->>'name',
                                resp_item->>'role',
                                resp_item->>'area',
                                resp_item->>'description',
                                resp_item->>'whatsapp',
                                resp_item->>'status',
                                resp_item->>'notes',
                                resp_item->>'sector',
                                COALESCE((resp_item->>'isLeader')::BOOLEAN, false),
                                COALESCE((resp_item->'position'->>'x')::NUMERIC, 0),
                                COALESCE((resp_item->'position'->>'y')::NUMERIC, 0),
                                resp_item->>'parentId'
                            )
                            ON CONFLICT (id) DO UPDATE SET
                                event_id = EXCLUDED.event_id,
                                name = EXCLUDED.name,
                                role = EXCLUDED.role,
                                area = EXCLUDED.area,
                                description = EXCLUDED.description,
                                whatsapp = EXCLUDED.whatsapp,
                                status = EXCLUDED.status,
                                notes = EXCLUDED.notes,
                                sector = EXCLUDED.sector,
                                is_leader = EXCLUDED.is_leader,
                                position_x = EXCLUDED.position_x,
                                position_y = EXCLUDED.position_y,
                                parent_id = EXCLUDED.parent_id;
                        END LOOP;
                    END IF;
                END IF;
            END;
        END LOOP;
    END IF;
END $$;