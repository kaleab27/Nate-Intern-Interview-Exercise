import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const StrategicAnalysisSchema = z.object({
  title: z.string().optional(),
  category: z.string(),
  scores: z.object({
    impact: z.number(),
    timing: z.number(),
    players: z.number(),
    precedent: z.number(),
  }),
  compositeScore: z.number(),
  takeaway: z.string(),
  breakdown: z.object({
    what: z.string(),
    whyItMatters: z.string(),
    timing: z.string(),
    implications: z.string(),
    connected: z.array(z.string()),
  }),
});

const outputParser = StructuredOutputParser.fromZodSchema(
  StrategicAnalysisSchema
);
const formatInstructions = outputParser.getFormatInstructions();

function escapeCurlyBraces(str: string) {
  return str.replace(/{/g, "{{").replace(/}/g, "}}");
}

const escapedFormatInstructions = escapeCurlyBraces(formatInstructions);

// const promptTemplate =
//   "You're an AI strategy analyst. Given a story title and summary, return a JSON object in the following format:\n\n" +
//   escapedFormatInstructions +
//   "\n\n### Input:\n\nTitle: {{title}}\nSummary: {{summary}}";

const promptTemplate = `
You are a senior tech industry strategist analyzing breaking developments. 

STRICT REQUIREMENTS:
1. Keep the original story title exactly as provided
2. Category MUST match the story's actual domain (biotech, government, toys, AI safety, etc.)
3. Analysis must be SPECIFIC to this exact story - no generic AI education responses

OUTPUT FORMAT:
${escapedFormatInstructions}

STORY TO ANALYZE:
Title: {title}
Summary: {summary}

ANALYSIS GUIDELINES:
- Impact score: How transformative is this development? (0-1)
- Timing: How imminent is impact? (0-1) 
- Players: How many major actors are involved? (0-1)
- Precedent: How novel is this development? (0-1)
- Connected concepts: Should be highly specific to this story
`;

const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0,
});

async function callGemini(input: { title: string; summary: string }) {
  console.log("Calling Gemini with:", input);
  const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);
  const chain = RunnableSequence.from([prompt, gemini, outputParser]);
  return await chain.invoke(input);
}

export async function generateStrategicAnalysis(story: {
  title: string;
  summary: string;
}) {
  return await callGemini(story);
}
