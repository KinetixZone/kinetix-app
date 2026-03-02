import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate environment variable
const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error('VITE_GOOGLE_AI_API_KEY is not defined in environment variables');
}

const ai = new GoogleGenerativeAI(apiKey || '');

export const generateWorkoutPlan = async (
  userProfile: any,
  preferences: any,
  equipment: string[]
): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error('Google AI API key is not configured');
    }

    const systemInstruction = `
      Eres un entrenador personal experto. Genera un plan de entrenamiento personalizado en formato JSON válido.
      
      Estructura requerida:
      {
        "workoutPlan": {
          "name": "Nombre del plan",
          "duration": "Duración en semanas",
          "frequency": "Frecuencia semanal",
          "exercises": [
            {
              "name": "Nombre del ejercicio",
              "sets": número_de_series,
              "reps": "repeticiones o tiempo",
              "rest": "tiempo_de_descanso",
              "equipment": ["equipamiento_necesario"],
              "instructions": "instrucciones_detalladas",
              "targetMuscles": ["músculos_objetivo"]
            }
          ],
          "notes": "Notas adicionales y consejos"
        }
      }
      
      Responde SOLO con JSON válido, sin texto adicional.
    `;

    const prompt = `
      Perfil del usuario:
      - Nivel: ${userProfile.level || 'Principiante'}
      - Objetivos: ${userProfile.goals || 'Fitness general'}
      - Edad: ${userProfile.age || 'No especificada'}
      - Experiencia: ${userProfile.experience || 'Principiante'}
      
      Preferencias:
      - Tipo de entrenamiento: ${preferences.workoutType || 'Fuerza'}
      - Duración por sesión: ${preferences.duration || '45-60 minutos'}
      - Días por semana: ${preferences.frequency || '3-4 días'}
      
      Equipamiento disponible: ${equipment.join(', ') || 'Peso corporal'}
      
      Genera un plan de entrenamiento personalizado siguiendo la estructura JSON especificada.
    `;

    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    // Validate JSON response
    try {
      JSON.parse(text);
      return text.trim();
    } catch (jsonError) {
      console.error('Invalid JSON response from AI:', text);
      throw new Error('AI service returned invalid JSON format');
    }

  } catch (error) {
    console.error('Error generating workout plan:', error);
    
    // Return fallback workout plan
    const fallbackPlan = {
      workoutPlan: {
        name: "Plan de Entrenamiento Básico",
        duration: "4 semanas",
        frequency: "3 días por semana",
        exercises: [
          {
            name: "Flexiones",
            sets: 3,
            reps: "8-12",
            rest: "60 segundos",
            equipment: ["Peso corporal"],
            instructions: "Mantén el cuerpo recto, baja hasta que el pecho casi toque el suelo",
            targetMuscles: ["Pecho", "Tríceps", "Hombros"]
          },
          {
            name: "Sentadillas",
            sets: 3,
            reps: "12-15",
            rest: "60 segundos",
            equipment: ["Peso corporal"],
            instructions: "Baja como si te fueras a sentar, mantén la espalda recta",
            targetMuscles: ["Cuádriceps", "Glúteos", "Isquiotibiales"]
          },
          {
            name: "Plancha",
            sets: 3,
            reps: "30-60 segundos",
            rest: "60 segundos",
            equipment: ["Peso corporal"],
            instructions: "Mantén el cuerpo recto como una tabla, contrae el core",
            targetMuscles: ["Core", "Hombros", "Espalda"]
          }
        ],
        notes: "Plan básico de entrenamiento. Ajusta las repeticiones según tu nivel."
      }
    };

    return JSON.stringify(fallbackPlan);
  }
};

export const getExerciseAdvice = async (
  exerciseName: string,
  userStats: any
): Promise<string> => {
  try {
    if (!apiKey) {
      return "Configura tu API key para obtener consejos personalizados.";
    }

    const systemInstruction = `
      Eres un entrenador personal experto. Proporciona consejos específicos y prácticos 
      sobre ejercicios, considerando las estadísticas del usuario.
      
      Responde de manera concisa y práctica, enfocándote en:
      - Técnica correcta
      - Progresión adecuada
      - Prevención de lesiones
      - Consejos específicos basados en las estadísticas del usuario
    `;

    const prompt = `
      Ejercicio: ${exerciseName}
      
      Estadísticas del usuario:
      ${JSON.stringify(userStats, null, 2)}
      
      Proporciona consejos específicos para mejorar en este ejercicio.
    `;

    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text?.trim() || "No se pudo generar consejo específico.";

  } catch (error) {
    console.error('Error getting exercise advice:', error);
    return `Para mejorar en ${exerciseName}, enfócate en la técnica correcta y progresión gradual. Consulta con un entrenador si tienes dudas sobre la forma adecuada.`;
  }
};

export const analyzeWorkoutProgress = async (
  workoutHistory: any[]
): Promise<string> => {
  try {
    if (!apiKey) {
      return "Configura tu API key para obtener análisis detallado de progreso.";
    }

    if (!workoutHistory || workoutHistory.length === 0) {
      return "No hay suficiente historial de entrenamientos para analizar.";
    }

    const systemInstruction = `
      Eres un analista de fitness experto. Analiza el historial de entrenamientos 
      y proporciona insights valiosos sobre el progreso del usuario.
      
      Enfócate en:
      - Tendencias de progreso
      - Áreas de mejora
      - Recomendaciones específicas
      - Patrones en el rendimiento
      
      Responde de manera motivadora y constructiva.
    `;

    const prompt = `
      Historial de entrenamientos:
      ${JSON.stringify(workoutHistory.slice(-10), null, 2)}
      
      Analiza el progreso y proporciona insights útiles.
    `;

    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 768,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text?.trim() || "No se pudo analizar el progreso en este momento.";

  } catch (error) {
    console.error('Error analyzing workout progress:', error);
    return "Continúa con tus entrenamientos regulares. El progreso se ve mejor con consistencia a largo plazo.";
  }
};