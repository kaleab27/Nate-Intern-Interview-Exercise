import { fetchArxiv } from "@/app/fetchStories";

export async function GET() {
  try {
    const data = await fetchArxiv();
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return new Response("Failed to fetch arXiv papers", { status: 500 });
  }
}
