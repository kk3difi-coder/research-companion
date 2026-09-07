import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { demoSearch } from "@/lib/demo-data";
import { Markdown } from "@/components/research/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Lock, PlayCircle, Sparkles, Telescope } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo research — Lumen Research Desk" },
      {
        name: "description",
        content:
          "Explore a finished sample research project: ranked sources, relevance scores, images, a written synthesis and a follow-up conversation.",
      },
      { property: "og:title", content: "Demo research — Lumen Research Desk" },
      {
        property: "og:description",
        content: "A finished sample research project you can read without signing up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [question, setQuestion] = useState("");
  const demo = demoSearch;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Telescope className="size-5 text-primary" />
          <span className="font-display text-base tracking-tight">Lumen Research Desk</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge className="hidden sm:inline-flex" variant="secondary">
            Sample data
          </Badge>
          <Button size="sm" asChild>
            <Link to="/auth">Start your own research</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <PlayCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">You're viewing the demo.</p>
            <p className="text-muted-foreground">
              This is a finished example so you can see what a research project looks like. Nothing here is
              saved, nothing can be changed, and it is completely separate from anyone's real work.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">Demo</Badge>
            <span className="text-xs text-muted-foreground">Sample research · {demo.createdAt}</span>
          </div>
          <h1 className="font-display text-2xl tracking-tight text-foreground">{demo.topic}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {demo.keywords.map((k) => (
              <Badge key={k} variant="outline">
                {k}
              </Badge>
            ))}
            <Badge variant="outline">
              {demo.dateFrom} → {demo.dateTo}
            </Badge>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg tracking-tight">
            <Sparkles className="size-4 text-primary" /> Synthesis
          </h2>
          <Markdown>{demo.synthesis}</Markdown>
          <div className="mt-5 rounded-lg bg-muted p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Key highlights
            </p>
            <ul className="space-y-1.5 text-sm">
              {demo.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg tracking-tight">Images from the sources</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {demo.images.map((img) => (
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

        <section>
          <h2 className="mb-3 font-display text-lg tracking-tight">
            Ranked sources ({demo.sources.length})
          </h2>
          <ul className="space-y-3">
            {demo.sources.map((source) => (
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
                    <p className="mt-2 text-sm text-muted-foreground">{source.snippet}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-display text-lg text-primary">{source.relevance}%</span>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">relevance</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${source.relevance}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Sample links are illustrative and do not point to live pages.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-display text-lg tracking-tight">Follow-up conversation</h2>
          <div className="space-y-3">
            {demo.messages.map((message) => (
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
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Asking your own questions needs an account"
              disabled
            />
            <Button asChild>
              <Link to="/auth">
                <Lock className="mr-2 size-4" /> Sign up to ask
              </Link>
            </Button>
          </div>
        </section>

        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Ready to research your own topic, with everything saved to your account?
          </p>
          <Button className="mt-3" asChild>
            <Link to="/auth">Create your desk</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
