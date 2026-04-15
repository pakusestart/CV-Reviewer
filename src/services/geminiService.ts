import { GoogleGenAI, Type } from "@google/genai";
import { CVAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeCV(text: string, targetJob: string): Promise<CVAnalysis> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const prompt = `
    Analyze the following CV/Resume text and provide a comprehensive review tailored for the target job: "${targetJob}".
    
    CRITICAL: Auto-detect the language of the CV. 
    - If the CV is in Indonesian, provide ALL analysis, summaries, strengths, weaknesses, improvements, and hiring tips in INDONESIAN.
    - If the CV is in English, provide EVERYTHING in ENGLISH.
    - This includes the "summary" field, which MUST be in the same language as the CV.
    
    Focus on:
    1. Impact: Are the bullet points action-oriented?
    2. Metrics: Is there enough quantification of achievements?
    3. Keywords: Does it match modern industry standards for the target job: "${targetJob}"?
    4. Formatting: Identify potential ATS parsing issues.
    5. Hiring Manager Perspective: What specific, actionable changes would make this candidate stand out for "${targetJob}"?
    6. Extraction: Extract key information like name, contact details, education history, work experience, and core skills.
    7. Probabilities: Estimate the probability (0-100) of this candidate being accepted for the target job at different levels: Junior, Senior, and Manager.
    8. Level Recommendations: For each level (Junior, Senior, Manager), provide an EXTREMELY DETAILED, step-by-step roadmap on how to improve the CV to reach or excel at that level. 
       - Include specific technical skills to master, soft skills to demonstrate, types of high-impact projects to add, and specific ways to rephrase existing experience to match that seniority.
       - If the candidate's highest probability is at a certain level, provide tips to make their profile in that level "world-class".
       - For higher levels, provide a clear "bridge" strategy.
    9. Job Alignment: Provide a specific score (0-100) and a detailed paragraph explaining how well the CV aligns with the specific requirements and expectations of the target job: "${targetJob}".
    10. Strengths: Provide HIGHLY DETAILED explanations for each key strength. Don't just list them; explain the "why" and "how" it benefits the target employer.
    11. Summary (Key Insights): Provide a very detailed executive summary that covers market positioning, unique value proposition, and strategic fit.
    12. Recommended Jobs: Based on the candidate's skills and experience, suggest 3 other job titles that would be a great fit for them.

    CV Text:
    ${text}

    Return the analysis in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Overall score out of 100" },
          summary: { type: Type.STRING, description: "Brief executive summary of the CV" },
          targetJob: { type: Type.STRING, description: "The job title being targeted" },
          language: { type: Type.STRING, enum: ["id", "en"], description: "Detected language" },
          jobAlignment: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING }
            },
            required: ["score", "analysis"]
          },
          probabilities: {
            type: Type.OBJECT,
            properties: {
              junior: { type: Type.NUMBER },
              senior: { type: Type.NUMBER },
              manager: { type: Type.NUMBER }
            },
            required: ["junior", "senior", "manager"]
          },
          levelRecommendations: {
            type: Type.OBJECT,
            properties: {
              junior: { type: Type.STRING },
              senior: { type: Type.STRING },
              manager: { type: Type.STRING }
            },
            required: ["junior", "senior", "manager"]
          },
          recommendedJobs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 recommended job titles based on skills"
          },
          strengths: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of key strengths"
          },
          weaknesses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["impact", "metrics", "keywords", "formatting"] }
              },
              required: ["title", "description", "category"]
            }
          },
          improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                revised: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["original", "revised", "reason"]
            }
          },
          atsMatch: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "missingKeywords", "formattingIssues"]
          },
          hiringTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable tips to make the CV more attractive to companies"
          },
          extractedInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              contact: { type: Type.STRING },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["name", "contact", "education", "experience", "skills", "summary"]
          }
        },
        required: ["score", "summary", "targetJob", "language", "jobAlignment", "probabilities", "levelRecommendations", "recommendedJobs", "strengths", "weaknesses", "improvements", "atsMatch", "hiringTips", "extractedInfo"]
      }
    }
  });

  const content = response.text;
  if (!content) throw new Error("No response from AI");
  
  return JSON.parse(content) as CVAnalysis;
}
