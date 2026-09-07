import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Telescope, ListOrdered, Sparkles, MessagesSquare, Archive } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Research Desk — web research, ranked and synthesized" },
      {
        name: "description",
        content:
          "Search any topic by site, date and keywords. Get ranked links with relevance scores, an AI synthesis with highlights, and a chatbot for follow-ups.",
      },
      { property: "og:title", content: "Lumen Research Desk" },
      {
        property: "og:description",
        content: "Ranked sources, an AI synthesis with highlights and a research chatbot — all saved for later.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: ListOrdered,
    title: "Ranked links",
    body: "Every result gets a relevance score so the strongest sources rise to the top.",
  },
  {
    icon: Sparkles,
    title: "Readable synthesis",
    body: "A short written brief with key highlights and images pulled from the sources.",
  },
  {
    icon: MessagesSquare,
    title: "Follow-up chat",
    body: "Ask questions about the findings or refine the topic without starting over.",
  },
  {
    icon: Archive,
    title: "Saved for later",
    body: "Searches, sources, summaries and conversations stay on your desk.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Telescope className="size-5 text-primary" />
          <span className="font-display text-base tracking-tight">Lumen Research Desk</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Research workspace
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Ask the web a real question. Get a briefing back.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Set a topic, a site, a date window and keywords. Lumen reads the pages, scores each source and
            writes an easy-to-read synthesis you can question.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start researching</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-card p-5">
              <feature.icon className="size-5 text-primary" />
              <h2 className="mt-3 font-display text-lg tracking-tight">{feature.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Lumen Research Desk
      </footer>
    </div>
  );
}
