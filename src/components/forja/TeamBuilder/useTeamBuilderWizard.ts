import { useState, useEffect } from "react";
import { type TeamBuilderData, INITIAL_WIZARD_DATA } from "./types";
import { generateTeamRecommendation, type TeamRecommendation } from "@/lib/team-builder";
import { useForja } from "@/components/forja/store";
import { convertRecommendationToResponsibles } from "@/lib/team-builder";

export function useTeamBuilderWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TeamBuilderData>(INITIAL_WIZARD_DATA);
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addResponsiblesBulk, updateEventData } = useForja();

  const updateData = (patch: Partial<TeamBuilderData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(4);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const recs = generateTeamRecommendation({
      attendeeCount: data.attendeeCount,
      selectedOptions: data.selectedOptions,
      stages: data.stages,
      speakers: data.speakers,
      registrationType: data.registrationType,
      cateringType: data.cateringType,
      livestreamDedicated: data.livestreamDedicated,
      exhibitors: data.exhibitors,
      vipCount: data.vipCount,
      layout: data.layout,
      duration: data.duration,
      venueProvidedTeams: data.venueProvidedTeams,
    });
    setRecommendations(recs);
    setIsAnalyzing(false);
  };

  const applyRecommendations = () => {
    const responsibles = convertRecommendationToResponsibles(recommendations);
    
    // Update event data with attendees count and layout if relevant to EventConfig
    updateEventData({
      event: {
        attendees: data.attendeeCount,
        layout: data.layout,
        // Keep other fields if they exist in EventConfig
      } as any,
      responsibles: responsibles
    });
  };

  const resetWizard = () => {
    setStep(1);
    setData(INITIAL_WIZARD_DATA);
    setRecommendations([]);
  };

  return {
    step,
    data,
    recommendations,
    isAnalyzing,
    updateData,
    nextStep,
    prevStep,
    startAnalysis,
    applyRecommendations,
    resetWizard,
  };
}
