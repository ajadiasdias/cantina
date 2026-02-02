
import { GoogleGenAI } from "@google/genai";

// Use GoogleGenAI to generate insights from productivity data using gemini-3-flash-preview
export async function getReportInsights(data: any) {
  // Always obtain the API key exclusively from process.env.API_KEY
  if (!process.env.API_KEY) return "Configuração de API pendente.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analise os seguintes dados de produtividade da Cantina D'Itália: ${JSON.stringify(data)}. 
  Forneça um breve resumo (3 parágrafos) com: 
  1. Taxa de conclusão geral. 
  2. Setor com melhor desempenho. 
  3. Sugestão de melhoria operacional. 
  Responda de forma profissional em português do Brasil.`;

  try {
    // Correctly calling generateContent with model and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Extract text output using the .text property (not a method)
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar insights no momento.";
  }
}
