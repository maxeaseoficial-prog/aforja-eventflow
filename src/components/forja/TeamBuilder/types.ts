import { z } from "zod";

export const TeamBuilderSchema = z.object({
  attendeeCount: z.number().min(0),
  selectedOptions: z.array(z.string()),
  stages: z.number().min(1),
  speakers: z.number().min(0),
  registrationType: z.string(),
  cateringType: z.string(),
  livestreamDedicated: z.boolean(),
  exhibitors: z.number().min(0),
  vipCount: z.number().min(0),
  layout: z.string(),
  duration: z.string(),
  venueProvidedTeams: z.array(z.string()),
});

export type TeamBuilderData = z.infer<typeof TeamBuilderSchema>;

export const INITIAL_WIZARD_DATA: TeamBuilderData = {
  attendeeCount: 0,
  selectedOptions: [],
  stages: 1,
  speakers: 0,
  registrationType: "Lista simples",
  cateringType: "Coffee break simples",
  livestreamDedicated: false,
  exhibitors: 0,
  vipCount: 0,
  layout: "Um único ambiente",
  duration: "Até 3 horas",
  venueProvidedTeams: [],
};
