import { useState } from "react";
import { type TeamBuilderData, INITIAL_WIZARD_DATA } from "./types";
import { generateTeamRecommendation, type TeamRecommendation } from "@/lib/team-builder";

export function useTeamBuilderWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TeamBuilderData>(INITIAL_WIZARD_DATA);
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    
    const recs = generateTeamRecommendation(data);
    setRecommendations(recs);
    setIsAnalyzing(false);
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
    resetWizard,
    setRecommendations,
  };
}
