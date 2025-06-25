import { fetchDeepSeek } from "@/app/fetchStories";

export async function GET() {
  try {
    const data = await fetchDeepSeek();
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return new Response("Failed to fetch DeepSeek blog", { status: 500 });
  }
}
