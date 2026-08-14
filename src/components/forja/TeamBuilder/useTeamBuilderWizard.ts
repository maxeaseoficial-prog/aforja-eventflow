import { useState } from "react";
import { type TeamBuilderData, INITIAL_WIZARD_DATA } from "./types";
import { generateTeamRecommendation, type TeamRecommendation } from "@/lib/team-builder";
import { useForja } from "@/components/forja/store";
import { convertRecommendationToResponsibles } from "@/lib/team-builder";

export function useTeamBuilderWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TeamBuilderData>(INITIAL_WIZARD_DATA);
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addResponsiblesBulk } = useForja();

  const updateData = (patch: Partial<TeamBuilderData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(4); // Suggestion step
    
    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Note: EventProfile shape needs to match TeamBuilderData logic if different
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
    addResponsiblesBulk(responsibles);
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
