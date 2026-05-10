"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSettings } from "@/lib/store/settings";
import { fetchRepositoryProviders } from "@/lib/source-repositories";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Database, Globe2, Link2, Plug, RefreshCw, Search, Trash2 } from "lucide-react";

const KEIYOUSHI_REPO = "https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json";

export default function SourcesPage() {
  const {
    settings,
    addSourceRepository,
    removeSourceRepository,
    toggleSourceProvider,
    setActiveSource,
  } = useSettings();
  const [repoUrl, setRepoUrl] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const enabledIds = new Set(settings.enabledSourceIds);
  const filteredProviders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return settings.sourceProviders.filter((source) => {
      if (!q) return true;
      return [source.name, source.lang, source.repositoryName, source.packageName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q));
    });
  }, [query, settings.sourceProviders]);

  const addRepository = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      setStatus("loading");
      setMessage("");
      const { repo, providers } = await fetchRepositoryProviders(trimmed);
      addSourceRepository(repo, providers);
      setRepoUrl("");
      setStatus("ok");
      setMessage(`Added ${providers.length} providers from ${repo.name}.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not add repository.");
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Sources" backHref="/settings" />

      <div className="px-4 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={18} className="text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-text text-sm font-semibold">Extension repositories</p>
            <p className="text-text-secondary text-xs mt-0.5">
              Paste a Mihon/Tachiyomi-compatible repo index URL.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void addRepository(repoUrl);
            }}
            placeholder="https://.../index.min.json"
            aria-label="Repository index URL"
            className="min-w-0 flex-1 h-10 px-3 rounded-lg bg-elevated border border-border text-text text-sm outline-none focus:border-primary"
          />
          <Button
            onClick={() => void addRepository(repoUrl)}
            loading={status === "loading"}
            disabled={!repoUrl.trim()}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        <button
          onClick={() => void addRepository(KEIYOUSHI_REPO)}
          className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:text-secondary transition-colors"
        >
          <Database size={13} />
          Add Keiyoushi repository
        </button>

        {message && (
          <div
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
              status === "error"
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-success/40 bg-success/10 text-success"
            )}
          >
            {status === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
            {message}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">Repositories</p>
        {settings.sourceRepositories.length ? (
          <div className="flex flex-col gap-2">
            {settings.sourceRepositories.map((repo) => (
              <div key={repo.id} className="flex items-center gap-3 rounded-lg bg-surface border border-border px-3 py-2">
                <Database size={17} className="text-text-secondary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{repo.name}</p>
                  <p className="text-xs text-text-secondary truncate">{repo.providerCount} providers · {repo.url}</p>
                </div>
                <button
                  onClick={() => removeSourceRepository(repo.id)}
                  aria-label={`Remove ${repo.name}`}
                  className="p-2 rounded-full text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">No external repositories added yet.</p>
        )}
      </div>

      <div className="px-4 py-3 border-b border-border relative">
        <div className="relative flex items-center bg-elevated rounded-full px-4 h-9 gap-2">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search providers..."
            aria-label="Search providers"
            className="flex-1 bg-transparent text-text text-sm placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {filteredProviders.length ? (
        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 fade-in">
          {filteredProviders.map((source) => {
            const enabled = enabledIds.has(source.id);
            const active = settings.activeSourceId === source.id;

            return (
              <div key={source.id} className="rounded-lg bg-surface border border-border px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-primary shrink-0">
                    <Globe2 size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-text text-sm font-semibold truncate">{source.name}</p>
                      {active && <span className="badge">Active</span>}
                    </div>
                    <p className="text-text-secondary text-xs mt-0.5 truncate">
                      {source.repositoryName} · {source.lang.toUpperCase()}
                      {source.version ? ` · v${source.version}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={cn("chip h-6 text-[11px]", source.searchable && "active")}>
                        {source.searchable ? "Search ready" : "Adapter needed"}
                      </span>
                      {source.nsfw && <span className="chip h-6 text-[11px]">NSFW</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant={enabled ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleSourceProvider(source.id)}
                    disabled={source.id === "builtin:mangadex"}
                    className="flex-1"
                  >
                    {enabled ? <Check size={14} /> : <Plug size={14} />}
                    {enabled ? "Enabled" : "Enable"}
                  </Button>
                  <Button
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveSource(source.id)}
                    disabled={!source.searchable}
                    className="flex-1"
                  >
                    <RefreshCw size={14} />
                    Use
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Search size={48} />} title="No providers" description="Try another search or add a repository." />
      )}
    </div>
  );
}
