import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  askFollowUp,
  deleteSearch,
  getSearch,
  listSearches,
  runResearch,
} from "@/lib/research.functions";
import { SearchForm, type ResearchInput } from "@/components/research/SearchForm";
import { Markdown } from "@/components/research/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  ExternalLink,
  FileSearch,
  Loader2,
  LogOut,
  Plus,
  SendHorizonal,
  Sparkles,
  Telescope,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Research workspace — Lumen Research Desk" },
      {
        name: "description",
        content:
          "Search the web by domain, topic, date and keywords, then read a ranked, AI-written synthesis with follow-up chat.",
      },
      { property: "og:title", content: "Research workspace — Lumen Research Desk" },
      {
        property: "og:description",
        content: "Ranked sources, an easy-to-read synthesis and a research chatbot in one workspace.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const list = useServerFn(listSearches);
  const fetchSearch = useServerFn(getSearch);
  const run = useServerFn(runResearch);
  const ask = useServerFn(askFollowUp);
  const remove = useServerFn(deleteSearch);

  const historyQuery = useQuery({ queryKey: ["searches"], queryFn: () => list({}) });

  const detailQuery = useQuery({
    queryKey: ["search", activeId],
    queryFn: () => fetchSearch({ data: { id: activeId as string } }),
    enabled: !!activeId,
  });

  const runMutation = useMutation({
    mutationFn: (input: ResearchInput) =>
      run({
        data: {
          topic: input.topic,
          domain: input.domain || null,
          keywords: input.keywords,
          dateFrom: input.dateFrom || null,
          dateTo: input.dateTo || null,
        },
      }),
    onSuccess: (result) => {
      setActiveId(result.searchId);
      queryClient.invalidateQueries({ queryKey: ["searches"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const askMutation = useMutation({
    mutationFn: (text: string) => ask({ data: { searchId: activeId as string, question: text } }),
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["search", activeId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: (_r, id) => {
      if (activeId === id) setActiveId(null);
      queryClient.invalidateQueries({ queryKey: ["searches"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detailQuery.data?.messages.length, askMutation.isPending]);

  const detail = detailQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <Telescope className="size-5 text-primary" />
          <span className="font-display text-base tracking-tight">Lumen Research Desk</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            queryClient.clear();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => setActiveId(null)}>
            <Plus className="mr-2 size-4" /> New research
          </Button>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Saved searches
            </p>
            {historyQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (historyQuery.data ?? []).length === 0 ? (
              <p className="px-1 py-3 text-sm text-muted-foreground">
                Nothing saved yet. Your first search will show up here.
              </p>
            ) : (
              <ul className="space-y-1">
                {(historyQuery.data ?? []).map((item) => (
                  <li key={item.id}>
                    <div
                      className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                        activeId === item.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <button className="flex-1 truncate text-left" onClick={() => setActiveId(item.id)}>
                        {item.topic}
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.domain || "whole web"} ·{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </button>
                      <button
                        aria-label="Delete search"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="space-y-6">
          {!activeId && (
            <>
              <div>
                <h1 className="font-display text-2xl tracking-tight text-foreground">
                  What should we look into?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set a topic, narrow it to a site, a date window or keywords, and we'll read the web for you.
                </p>
              </div>
              <SearchForm onRun={(input) => runMutation.mutate(input)} running={runMutation.isPending} />
              {runMutation.isPending && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Searching, reading pages and writing the
                    synthesis…
                  </p>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {!runMutation.isPending && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <FileSearch className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Results, highlights and images will appear here once a search finishes.
                  </p>
                </div>
              )}
            </>
          )}

          {activeId && detailQuery.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {activeId && detailQuery.isError && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
              <AlertTriangle className="mt-0.5 size-5 text-destructive" />
              <div>
                <p className="font-medium">We couldn't open this search.</p>
                <p className="text-sm text-muted-foreground">{(detailQuery.error as Error).message}</p>
              </div>
            </div>
          )}

          {detail && (
            <>
              <div>
                <h1 className="font-display text-2xl tracking-tight text-foreground">
                  {detail.search.topic}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {detail.search.domain && <Badge variant="secondary">{detail.search.domain}</Badge>}
                  {detail.search.keywords.map((k) => (
                    <Badge key={k} variant="outline">
                      {k}
                    </Badge>
                  ))}
                  {(detail.search.date_from || detail.search.date_to) && (
                    <Badge variant="outline">
                      {detail.search.date_from || "any"} → {detail.search.date_to || "today"}
                    </Badge>
                  )}
                </div>
              </div>

              {detail.search.status === "empty" && (
                <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  No matching pages were found. Try loosening the date range, the site filter or the keywords.
                </div>
              )}
              {detail.search.status === "error" && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm">
                  {detail.search.error}
                </div>
              )}

              {detail.search.synthesis && (
                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 flex items-center gap-2 font-display text-lg tracking-tight">
                    <Sparkles className="size-4 text-primary" /> Synthesis
                  </h2>
                  <Markdown>{detail.search.synthesis}</Markdown>
                  {detail.search.highlights.length > 0 && (
                    <div className="mt-5 rounded-lg bg-muted p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Key highlights
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {detail.search.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {detail.search.images.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-lg tracking-tight">Images from the sources</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {detail.search.images.map((img) => (
                      <figure key={img.url} className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={img.url}
                          alt={img.caption}
                          loading="lazy"
                          className="h-32 w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                          }}
                        />
                        <figcaption className="truncate bg-card px-2 py-1.5 text-xs text-muted-foreground">
                          {img.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {detail.sources.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-lg tracking-tight">
                    Ranked sources ({detail.sources.length})
                  </h2>
                  <ul className="space-y-3">
                    {detail.sources.map((source) => (
                      <li key={source.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
                            >
                              <span className="truncate">{source.title}</span>
                              <ExternalLink className="size-3.5 shrink-0" />
                            </a>
                            <p className="truncate text-xs text-muted-foreground">{source.url}</p>
                            {source.snippet && (
                              <p className="mt-2 text-sm text-muted-foreground">{source.snippet}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="font-display text-lg text-primary">
                              {Math.round(Number(source.relevance))}%
                            </span>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              relevance
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(Number(source.relevance))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-3 font-display text-lg tracking-tight">Ask a follow-up</h2>
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {detail.messages.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Ask anything about these findings, or ask to narrow the topic.
                    </p>
                  )}
                  {detail.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.role === "user" ? message.content : <Markdown>{message.content}</Markdown>}
                    </div>
                  ))}
                  {askMutation.isPending && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Thinking…
                    </p>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!question.trim()) return;
                    askMutation.mutate(question.trim());
                  }}
                >
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What changed most in the last year?"
                  />
                  <Button type="submit" disabled={askMutation.isPending || !question.trim()}>
                    <SendHorizonal className="size-4" />
                  </Button>
                </form>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
