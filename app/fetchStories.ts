import Parser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";

export interface RawStory {
  title: string;
  summary: string;
  source: string;
  pubData?: string;
}

// 1. arXiv AI RSS
export async function fetchArxiv(): Promise<RawStory[]> {
  const parser = new Parser();
  const feed = await parser.parseURL("https://arxiv.org/rss/cs.AI");
  return feed.items.slice(0, 5).map((item) => ({
    title: item.title || "",
    summary: item.contentSnippet || "",
    source: item.link || "https://arxiv.org",
    pubDate: item.isoDate || item.pubDate || "",
  }));
}

// 2. OpenAI Blog (RSS)
export async function fetchOpenAI(): Promise<RawStory[]> {
  const parser = new Parser();
  const feed = await parser.parseURL("https://openai.com/blog/rss.xml");
  return feed.items.slice(0, 5).map((item) => ({
    title: item.title || "",
    summary: item.contentSnippet || "",
    source: item.link || "https://openai.com/blog",
    pubDate: item.isoDate || item.pubDate || "",
  }));
}

// 3. DeepSeek GitHub (fallback: web scrape)
export async function fetchDeepSeek(): Promise<RawStory[]> {
  const { data } = await axios.get("https://github.com/deepseek-ai");
  const $ = cheerio.load(data);
  const repos: RawStory[] = [];

  $(".Box-row")
    .slice(0, 5)
    .each((_, el) => {
      const title = $(el).find("h3").text().trim().replace(/\s+/g, " ");
      const summary = $(el).find("p").text().trim();
      const href = $(el).find("a").attr("href");
      if (title && summary && href) {
        repos.push({
          title,
          summary,
          source: `https://github.com${href}`,
        });
      }
    });

  return repos;
}

// (Not Complete) 4. Twitter via Nitter
export async function fetchFromNitter(username: string): Promise<RawStory[]> {
  const { data } = await axios.get(`https://nitter.net/${username}`);
  const $ = cheerio.load(data);
  const tweets: RawStory[] = [];

  $("div.timeline-item")
    .slice(0, 5)
    .each((_, el) => {
      const content = $(el).find(".tweet-content").text().trim();
      const link = $(el).find("a.tweet-date").attr("href");
      if (content && link) {
        tweets.push({
          title: content.slice(0, 80) + "...",
          summary: content,
          source: `https://nitter.net${link}`,
        });
      }
    });

  return tweets;
}
