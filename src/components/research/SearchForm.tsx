import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X } from "lucide-react";

export type ResearchInput = {
  topic: string;
  domain: string;
  keywords: string[];
  dateFrom: string;
  dateTo: string;
};

export function SearchForm({
  onRun,
  running,
}: {
  onRun: (input: ResearchInput) => void;
  running: boolean;
}) {
  const [topic, setTopic] = useState("");
  const [domain, setDomain] = useState("");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const addKeyword = () => {
    const value = keywordDraft.trim();
    if (!value || keywords.includes(value) || keywords.length >= 12) return;
    setKeywords([...keywords, value]);
    setKeywordDraft("");
  };

  return (
    <form
      className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        onRun({ topic: topic.trim(), domain: domain.trim(), keywords, dateFrom, dateTo });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="topic">Topic or question</Label>
        <Input
          id="topic"
          placeholder="How are EU battery recycling rules changing?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="domain">Limit to a website (optional)</Label>
          <Input
            id="domain"
            placeholder="reuters.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex gap-2">
            <Input
              id="keywords"
              placeholder="press enter to add"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addKeyword}>
              Add
            </Button>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <Badge key={k} variant="secondary" className="gap-1">
              {k}
              <button type="button" onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from">Published after</Label>
          <Input id="from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Published before</Label>
          <Input id="to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={running || !topic.trim()}>
        {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
        {running ? "Researching the web…" : "Run research"}
      </Button>
    </form>
  );
}
