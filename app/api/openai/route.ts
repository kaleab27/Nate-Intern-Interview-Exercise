import { fetchOpenAI } from "@/app/fetchStories";

export async function GET() {
  try {
    const data = await fetchOpenAI();
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return new Response("Failed to fetch OpenAI blog", { status: 500 });
  }
}
