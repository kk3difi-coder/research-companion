import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RunInput = z.object({
  topic: z.string().min(2).max(300),
  domain: z.string().max(200).optional().nullable(),
  keywords: z.array(z.string().min(1).max(60)).max(12).default([]),
  dateFrom: z.string().max(20).optional().nullable(),
  dateTo: z.string().max(20).optional().nullable(),
});

export type SourceRow = {
  id: string;
  title: string;
  url: string;
  snippet: string | null;
  image_url: string | null;
  relevance: number;
  position: number;
};

export type SearchRow = {
  id: string;
  topic: string;
  domain: string | null;
  keywords: string[];
  date_from: string | null;
  date_to: string | null;
  status: string;
  error: string | null;
  synthesis: string | null;
  highlights: string[];
  images: { url: string; caption: string }[];
  created_at: string;
};

export type ChatRow = { id: string; role: string; content: string; created_at: string };

function buildQuery(input: z.infer<typeof RunInput>) {
  const parts = [input.topic];
  if (input.keywords.length) parts.push(input.keywords.join(" "));
  if (input.domain) parts.push(`site:${input.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`);
  if (input.dateFrom) parts.push(`after:${input.dateFrom}`);
  if (input.dateTo) parts.push(`before:${input.dateTo}`);
  return parts.join(" ");
}

export const runResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RunInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: search, error: insertError } = await supabase
      .from("searches")
      .insert({
        user_id: userId,
        topic: data.topic,
        domain: data.domain ?? null,
        keywords: data.keywords,
        date_from: data.dateFrom || null,
        date_to: data.dateTo || null,
        status: "running",
      })
      .select("id")
      .single();
    if (insertError || !search) throw new Error(insertError?.message ?? "Could not start this search.");

    const searchId = search.id as string;

    try {
      const { firecrawlSearch } = await import("./firecrawl.server");
      const { callAi, parseJsonLoose } = await import("./ai.server");

      const results = await firecrawlSearch({
        query: buildQuery(data),
        limit: 10,
        scrapeOptions: { formats: ["markdown"] },
      });

      const clean = results
        .filter((r) => r.url)
        .slice(0, 10)
        .map((r, i) => ({
          index: i,
          url: r.url as string,
          title: r.title || r.metadata?.title || r.url!,
          description: r.description || r.metadata?.description || "",
          image: r.metadata?.ogImage ?? null,
          content: (r.markdown ?? "").slice(0, 4000),
        }));

      if (clean.length === 0) {
        await supabase
          .from("searches")
          .update({ status: "empty", error: "No matching pages were found." })
          .eq("id", searchId);
        return { searchId };
      }

      const prompt = `Research request:
Topic: ${data.topic}
Domain filter: ${data.domain || "none"}
Keywords: ${data.keywords.join(", ") || "none"}
Date range: ${data.dateFrom || "any"} to ${data.dateTo || "any"}

Sources:
${clean.map((c) => `[${c.index}] ${c.title}\nURL: ${c.url}\n${c.description}\n${c.content}`).join("\n\n---\n\n")}

Return strict JSON:
{"synthesis": "markdown synthesis, 250-450 words, easy to read, with short sections", "highlights": ["5-7 short key takeaways"], "sources": [{"index": 0, "relevance": 0-100 integer, "snippet": "one sentence on why this source matters"}]}
Score relevance honestly against the topic, keywords, domain and date range.`;

      const raw = await callAi(
        [
          {
            role: "system",
            content:
              "You are a meticulous research analyst. Answer only with valid JSON matching the requested shape.",
          },
          { role: "user", content: prompt },
        ],
        { json: true },
      );

      const parsed = parseJsonLoose<{
        synthesis?: string;
        highlights?: string[];
        sources?: { index: number; relevance: number; snippet?: string }[];
      }>(raw);

      const scoreByIndex = new Map<number, { relevance: number; snippet?: string }>();
      for (const s of parsed?.sources ?? []) {
        scoreByIndex.set(Number(s.index), {
          relevance: Math.max(0, Math.min(100, Number(s.relevance) || 0)),
          ...(s.snippet ? { snippet: s.snippet } : {}),
        });
      }

      const rows = clean
        .map((c) => {
          const scored = scoreByIndex.get(c.index);
          return {
            search_id: searchId,
            user_id: userId,
            title: c.title,
            url: c.url,
            snippet: scored?.snippet ?? c.description ?? null,
            image_url: c.image,
            relevance: scored?.relevance ?? 50,
          };
        })
        .sort((a, b) => b.relevance - a.relevance)
        .map((r, i) => ({ ...r, position: i }));

      await supabase.from("sources").insert(rows);

      const images = clean
        .filter((c) => c.image)
        .slice(0, 6)
        .map((c) => ({ url: c.image as string, caption: c.title }));

      await supabase
        .from("searches")
        .update({
          status: "complete",
          synthesis: parsed?.synthesis ?? raw.slice(0, 6000),
          highlights: parsed?.highlights ?? [],
          images,
        })
        .eq("id", searchId);

      return { searchId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      await supabase.from("searches").update({ status: "error", error: message }).eq("id", searchId);
      throw new Error(message);
    }
  });

export const listSearches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("searches")
      .select("id, topic, domain, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; topic: string; domain: string | null; status: string; created_at: string }[];
  });

export const getSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [searchRes, sourcesRes, chatRes] = await Promise.all([
      supabase.from("searches").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("sources").select("*").eq("search_id", data.id).order("position"),
      supabase.from("chat_messages").select("*").eq("search_id", data.id).order("created_at"),
    ]);
    if (searchRes.error) throw new Error(searchRes.error.message);
    if (!searchRes.data) throw new Error("This search could not be found.");
    return {
      search: searchRes.data as unknown as SearchRow,
      sources: (sourcesRes.data ?? []) as unknown as SourceRow[],
      messages: (chatRes.data ?? []) as unknown as ChatRow[],
    };
  });

export const deleteSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("searches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const askFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ searchId: z.string().uuid(), question: z.string().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callAi } = await import("./ai.server");

    const [searchRes, sourcesRes, historyRes] = await Promise.all([
      supabase.from("searches").select("topic, synthesis, keywords, domain").eq("id", data.searchId).maybeSingle(),
      supabase.from("sources").select("title, url, snippet, relevance").eq("search_id", data.searchId).order("position").limit(10),
      supabase.from("chat_messages").select("role, content").eq("search_id", data.searchId).order("created_at").limit(40),
    ]);
    if (!searchRes.data) throw new Error("This search could not be found.");

    const sourceList = (sourcesRes.data ?? [])
      .map((s, i) => `[${i + 1}] ${s.title} (${s.url}) — ${s.snippet ?? ""}`)
      .join("\n");

    const history = (historyRes.data ?? []).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const answer = await callAi([
      {
        role: "system",
        content: `You are a research assistant helping refine a topic. Use only the research below plus general reasoning, cite sources as [n] when relevant, and be concise and clearly formatted in markdown.

Topic: ${searchRes.data.topic}
Synthesis: ${searchRes.data.synthesis ?? "not available"}

Sources:
${sourceList}`,
      },
      ...history,
      { role: "user", content: data.question },
    ]);

    const { error } = await supabase.from("chat_messages").insert([
      { search_id: data.searchId, user_id: userId, role: "user", content: data.question },
      { search_id: data.searchId, user_id: userId, role: "assistant", content: answer },
    ]);
    if (error) throw new Error(error.message);

    return { answer };
  });
