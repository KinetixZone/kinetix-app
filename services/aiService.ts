
import { GoogleGenAI } from "@google/genai";
import { Workout } from "../types/kinetix";
import { EXERCISES_DB } from "../constants/exercises";

class AiService {
  // Verificación de API KEY segura
  public get isConfigured() {
    try {
      const key = process.env.API_KEY;
      return !!(key && key.length > 20 && !key.includes('placeholder'));
    } catch {
      return false;
    }
  }

  // --- MODO FANTASMA: Rutinas pre-generadas para cuando no hay conexión ---
  private getSimulationWorkout(prompt?: string): Partial<Workout> {
    // Si el usuario pidió algo de "fuerza" o "pierna", damos algo acorde (Simulación Inteligente)
    const isLegs = prompt?.toLowerCase().includes('pierna') || prompt?.toLowerCase().includes('sentadilla');
    
    if (isLegs) {
        return {
            name: "SIMULACIÓN: LEG DAY POWER",
            publicTitle: "Pierna de Acero (Modo Offline)",
            exercises: [
                { exerciseId: 'leg-1', name: 'Sentadilla', targetSets: 4, targetReps: '6', targetRest: 180, method: 'ahap' },
                { exerciseId: 'leg-6', name: 'Prensa 45', targetSets: 3, targetReps: '12', targetRest: 90, method: 'standard' },
                { exerciseId: 'gl-1', name: 'Hip Thrust', targetSets: 3, targetReps: '10', targetRest: 90, method: 'standard' }
            ]
        };
    }

    return {
      name: "SIMULACIÓN: TÁCTICA v4.0",
      publicTitle: "Protocolo Obsidian (Demo)",
      exercises: [
        { 
          exerciseId: 'ch-1', 
          name: 'Press Banca (Modo AHAP)', 
          targetSets: 3, 
          targetReps: '5', 
          targetRest: 180, 
          method: 'ahap',
          coachCue: 'Control total. Foco en la fuerza.'
        },
        { 
          exerciseId: 'ch-2', 
          name: 'Press Inclinado (Dropset)', 
          targetSets: 3, 
          targetReps: '8', 
          targetRest: 90, 
          method: 'dropset', 
          dropsetConfig: { 
            drops: [{ weight: '-20%', reps: 'Fallo' }, { weight: '-40%', reps: 'Fallo' }] 
          }
        },
        { 
          exerciseId: 'fun-2', 
          name: 'Tabata Finisher', 
          targetSets: 8, 
          targetReps: 'Max', 
          targetRest: 10, 
          method: 'tabata', 
          tabataConfig: { 
            workTimeSec: 20, 
            restTimeSec: 10, 
            rounds: 8, 
            sequence: [{ exerciseId: 'fun-2', name: 'Burpees' }, { exerciseId: 'fun-4', name: 'Climbers' }] 
          } 
        }
      ]
    };
  }

  // VALIDACIÓN DE INTEGRIDAD (Anti-Alucinación)
  private validateWorkoutStructure(data: any): boolean {
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.exercises)) return false;
      if (!data.name) return false;
      if (data.exercises.length > 0 && !data.exercises[0].exerciseId) return false;
      return true;
  }

  async generateWorkoutPlan(prompt: string, availableExercises = EXERCISES_DB): Promise<Partial<Workout> | null> {
    // 1. FAIL-SAFE: Si no hay llave, usamos la simulación inmediatamente y SILENCIOSAMENTE.
    if (!this.isConfigured) {
      console.log("Kinetix AI: Modo Offline activo. Generando simulación.");
      // Pequeño delay para que se sienta que "piensa"
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      return this.getSimulationWorkout(prompt);
    }

    try {
      // FIX: Use named parameter directly with process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `Eres Kinetix AI Architect. Genera JSON para rutinas.
      ESTRUCTURA JSON: { "name": "...", "publicTitle": "...", "exercises": [ { "exerciseId": "...", "name": "...", "targetSets": 3, "targetReps": "10", "targetRest": 60, "method": "standard" } ] }
      Usa SOLO estos IDs: ${availableExercises.map(e => e.id).join(', ')}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Prompt: "${prompt}"`,
        config: { systemInstruction, responseMimeType: "application/json" }
      });
      
      // FIX: Directly access text property from response
      const text = response.text;
      if (!text) throw new Error("Invalid response");

      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1) throw new Error("Invalid JSON");

      const parsedData = JSON.parse(text.substring(firstBrace, lastBrace + 1));

      if (!this.validateWorkoutStructure(parsedData)) throw new Error("Invalid Schema");

      return parsedData;

    } catch (e) {
      console.error("AI Service Error:", e);
      // 2. Si falla la red o la IA, fallback a simulación
      return this.getSimulationWorkout(prompt);
    }
  }

  async getTechnicalAdvice(query: string): Promise<string> {
    if (!this.isConfigured) {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        return "Kinetix Ops (Offline): Mantén la espalda neutra y controla la respiración. (Conecta la API Key para consejos personalizados)";
    }
    try {
      // FIX: Use named parameter directly with process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: { systemInstruction: "Eres experto en biomecánica. Respuestas breves." }
      });
      // FIX: Directly access text property from response
      return response.text || "Sin respuesta.";
    } catch (e) {
      return "Error de conexión. Verifica tu red.";
    }
  }
}

export const aiService = new AiService();
