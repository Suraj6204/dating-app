import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  modelName: "text-embedding-3-small", 
});

export const generateBioEmbedding = async (text: string) => {
  const res = await embeddings.embedQuery(text);
  return res; // Ye 1536 numbers ka array return karega
};