const GATEWAY_URL = "https://connector-gateway.lovable.dev/firecrawl/v2";

export type FirecrawlResult = {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  metadata?: { ogImage?: string; title?: string; description?: string };
};

export async function firecrawlSearch(body: Record<string, unknown>): Promise<FirecrawlResult[]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const firecrawlKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !firecrawlKey) throw new Error("Web search is not configured for this app.");

  const response = await fetch(`${GATEWAY_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": firecrawlKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 402 || response.status === 403) {
      throw new Error("The web search service has run out of credits. Add credits and try again.");
    }
    throw new Error(`Web search failed [${response.status}]: ${text.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    data?: FirecrawlResult[] | { web?: FirecrawlResult[] };
    web?: FirecrawlResult[];
  };
  const raw = data.data;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.web)) return raw.web;
  if (Array.isArray(data.web)) return data.web;
  return [];
}
