import { GoogleGenAI, Type } from "@google/genai";
import { Vitals, TriageLevel, TriageAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function predictTriage(
  patientName: string,
  age: number,
  arrivalMode: string,
  vitals: Vitals,
  symptoms: string[]
): Promise<TriageAnalysis> {
  const prompt = `
    Perform a clinical triage assessment for the following patient:
    Name: ${patientName}
    Age: ${age}
    Arrival Mode: ${arrivalMode}
    Vitals:
      - Heart Rate: ${vitals.heartRate} bpm
      - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
      - SpO2: ${vitals.spO2}%
      - Temperature: ${vitals.temperature}°C
      - Pain Level: ${vitals.painLevel}/10
    Symptoms: ${symptoms.join(', ')}

    Based on clinical protocols, provide a detailed triage analysis in JSON format.
    Triage Levels: Emergency (Red), Urgent (Orange), Routine (Green), Self-care (Blue).

    The JSON must follow this schema:
    {
      "triageLevel": "Emergency" | "Urgent" | "Routine" | "Self-care",
      "priorityScore": number (0-100, percentage based on urgency),
      "severityScore": number (0-100, overall clinical severity),
      "status": string (e.g., "Critical Risk", "Moderate Risk", "Stable"),
      "reasoning": string[] (list of clinical observations),
      "riskIndicators": [
        { "label": "Heart Rate", "value": "130 bpm", "status": "High" | "Normal" | "Low" | "Critical" },
        ...
      ],
      "criticalAlerts": string[] (list of immediate life threats if any)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageLevel: {
              type: Type.STRING,
              enum: ["Emergency", "Urgent", "Routine", "Self-care"],
            },
            priorityScore: { type: Type.NUMBER },
            severityScore: { type: Type.NUMBER },
            status: { type: Type.STRING },
            reasoning: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskIndicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["Normal", "High", "Low", "Critical"] }
                },
                required: ["label", "value", "status"]
              }
            },
            criticalAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["triageLevel", "priorityScore", "severityScore", "status", "reasoning", "riskIndicators", "criticalAlerts"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as TriageAnalysis;
  } catch (error) {
    console.error("AI Service Error:", error);
    
    // Fallback: Generate triage based on clinical rules
    return generateRuleBasedTriage(patientName, age, arrivalMode, vitals, symptoms);
  }
}

// Fallback function using clinical rules
function generateRuleBasedTriage(
  patientName: string,
  age: number,
  arrivalMode: string,
  vitals: Vitals,
  symptoms: string[]
): TriageAnalysis {
  let triageLevel: TriageLevel = 'Routine';
  let priorityScore = 30;
  let severityScore = 20;
  let status = 'Stable';
  const reasoning: string[] = [];
  const riskIndicators: any[] = [];
  const criticalAlerts: string[] = [];

  // Evaluate vital signs
  if (vitals.heartRate < 50 || vitals.heartRate > 120) {
    riskIndicators.push({
      label: 'Heart Rate',
      value: `${vitals.heartRate} bpm`,
      status: vitals.heartRate < 40 || vitals.heartRate > 140 ? 'Critical' : 'High'
    });
    if (vitals.heartRate < 40 || vitals.heartRate > 140) {
      criticalAlerts.push('Critical heart rate detected');
      triageLevel = 'Emergency';
      priorityScore = 95;
      severityScore = 90;
    } else {
      triageLevel = 'Urgent';
      priorityScore = Math.max(priorityScore, 70);
      severityScore = Math.max(severityScore, 60);
    }
    reasoning.push(`Abnormal heart rate: ${vitals.heartRate} bpm`);
  } else {
    riskIndicators.push({
      label: 'Heart Rate',
      value: `${vitals.heartRate} bpm`,
      status: 'Normal'
    });
  }

  // Blood Pressure
  if (vitals.systolicBP > 180 || vitals.systolicBP < 90 || vitals.diastolicBP > 110) {
    riskIndicators.push({
      label: 'Blood Pressure',
      value: `${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
      status: vitals.systolicBP > 200 || vitals.systolicBP < 80 ? 'Critical' : 'High'
    });
    if (vitals.systolicBP > 200 || vitals.systolicBP < 80) {
      criticalAlerts.push('Critical blood pressure detected');
      triageLevel = 'Emergency';
      priorityScore = 95;
      severityScore = Math.max(severityScore, 85);
    } else if (triageLevel !== 'Emergency') {
      triageLevel = 'Urgent';
      priorityScore = Math.max(priorityScore, 65);
      severityScore = Math.max(severityScore, 55);
    }
    reasoning.push(`Abnormal blood pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`);
  } else {
    riskIndicators.push({
      label: 'Blood Pressure',
      value: `${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
      status: 'Normal'
    });
  }

  // Oxygen Saturation
  if (vitals.spO2 < 90) {
    riskIndicators.push({
      label: 'SpO2',
      value: `${vitals.spO2}%`,
      status: vitals.spO2 < 85 ? 'Critical' : 'High'
    });
    if (vitals.spO2 < 85) {
      criticalAlerts.push('Critical oxygen saturation - immediate intervention needed');
      triageLevel = 'Emergency';
      priorityScore = 98;
      severityScore = Math.max(severityScore, 95);
    } else if (triageLevel !== 'Emergency') {
      triageLevel = 'Urgent';
      priorityScore = Math.max(priorityScore, 75);
      severityScore = Math.max(severityScore, 70);
    }
    reasoning.push(`Low oxygen saturation: ${vitals.spO2}%`);
  } else {
    riskIndicators.push({
      label: 'SpO2',
      value: `${vitals.spO2}%`,
      status: 'Normal'
    });
  }

  // Temperature
  if (vitals.temperature < 35 || vitals.temperature > 39) {
    riskIndicators.push({
      label: 'Temperature',
      value: `${vitals.temperature}°C`,
      status: vitals.temperature < 34 || vitals.temperature > 40 ? 'Critical' : 'High'
    });
    if (vitals.temperature < 34 || vitals.temperature > 40) {
      criticalAlerts.push('Extreme temperature detected');
      triageLevel = 'Emergency';
      priorityScore = Math.max(priorityScore, 90);
      severityScore = Math.max(severityScore, 85);
    } else if (triageLevel !== 'Emergency' && triageLevel !== 'Urgent') {
      triageLevel = 'Urgent';
      priorityScore = Math.max(priorityScore, 60);
      severityScore = Math.max(severityScore, 50);
    }
    reasoning.push(`Abnormal temperature: ${vitals.temperature}°C`);
  } else {
    riskIndicators.push({
      label: 'Temperature',
      value: `${vitals.temperature}°C`,
      status: 'Normal'
    });
  }

  // Pain Level
  if (vitals.painLevel >= 8) {
    riskIndicators.push({
      label: 'Pain Level',
      value: `${vitals.painLevel}/10`,
      status: 'Critical'
    });
    if (triageLevel !== 'Emergency') {
      triageLevel = 'Urgent';
      priorityScore = Math.max(priorityScore, 70);
      severityScore = Math.max(severityScore, 65);
    }
    reasoning.push(`Severe pain reported: ${vitals.painLevel}/10`);
  } else if (vitals.painLevel >= 5) {
    riskIndicators.push({
      label: 'Pain Level',
      value: `${vitals.painLevel}/10`,
      status: 'High'
    });
    reasoning.push(`Moderate pain reported: ${vitals.painLevel}/10`);
  } else {
    riskIndicators.push({
      label: 'Pain Level',
      value: `${vitals.painLevel}/10`,
      status: 'Normal'
    });
  }

  // Check critical symptoms
  const criticalSymptoms = [
    'Chest Pain', 'Difficulty Breathing', 'Severe Bleeding', 
    'Unconsciousness', 'Stroke Symptoms', 'Severe Head Injury'
  ];
  
  const hasCriticalSymptom = symptoms.some(s => 
    criticalSymptoms.some(cs => s.toLowerCase().includes(cs.toLowerCase()))
  );

  if (hasCriticalSymptom) {
    triageLevel = 'Emergency';
    priorityScore = 95;
    severityScore = Math.max(severityScore, 90);
    criticalAlerts.push('Critical symptoms detected requiring immediate attention');
    reasoning.push('Patient presents with life-threatening symptoms');
  }

  // Arrival mode consideration
  if (arrivalMode === 'Ambulance' && triageLevel === 'Routine') {
    triageLevel = 'Urgent';
    priorityScore = Math.max(priorityScore, 55);
    reasoning.push('Arrived by ambulance - increased priority');
  }

  // Age consideration
  if (age < 2 || age > 70) {
    priorityScore = Math.min(100, priorityScore + 10);
    reasoning.push('Age factor increases vulnerability');
  }

  // Set status based on triage level
  if (triageLevel === 'Emergency') {
    status = 'Critical Risk';
  } else if (triageLevel === 'Urgent') {
    status = 'Moderate Risk';
  } else if (triageLevel === 'Routine') {
    status = 'Stable';
  } else {
    status = 'Low Risk';
  }

  if (reasoning.length === 0) {
    reasoning.push('All vital signs within normal range');
    reasoning.push('No immediate threats identified');
  }

  return {
    triageLevel,
    priorityScore,
    severityScore,
    status,
    reasoning,
    riskIndicators,
    criticalAlerts
  };
}
