"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { BrowseMangaCard } from "@/components/library/MangaCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { searchManga, getMangaTags } from "@/lib/api/mangadex";
import { getMangaTitle, getMangaCoverUrl } from "@/types";
import { useLibrary } from "@/lib/store/library";
import { useSettings } from "@/lib/store/settings";
import { Clock, Database, Filter, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MangaStatus, SearchFilters } from "@/types";

// ---------------------------------------------------------------------------
// Search-history helpers
// ---------------------------------------------------------------------------
const HISTORY_KEY = "mihon-search-history";
const MAX_HISTORY = 10;

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function addToHistory(term: string): void {
  if (!term.trim()) return;
  const h = [term, ...getHistory().filter((t) => t !== term)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function removeFromHistory(term: string): string[] {
  const h = getHistory().filter((t) => t !== term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  return h;
}

function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

type SortBy = "followedCount" | "latestUploadedChapter" | "rating" | "createdAt";

interface ActiveFilters {
  status: MangaStatus[];
  tags: string[];
}

const SORT_OPTIONS: { key: SortBy; label: string; icon: string }[] = [
  { key: "followedCount",          label: "Popular",       icon: "🔥" },
  { key: "latestUploadedChapter",  label: "Latest Update", icon: "🕐" },
  { key: "rating",                 label: "Top Rated",     icon: "⭐" },
  { key: "createdAt",              label: "Newest Added",  icon: "✨" },
];

const STATUS_OPTIONS: MangaStatus[] = ["ongoing", "completed", "hiatus", "cancelled"];

export default function BrowsePage() {
  const [sortBy, setSortBy] = useState<SortBy>("followedCount");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ status: [], tags: [] });
  const [history, setHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isInLibrary } = useLibrary();
  const { settings } = useSettings();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSearch = useCallback((q: string) => { setQuery(q); }, []);

  const { data: tagsData } = useQuery({
    queryKey: ["manga-tags"],
    queryFn: getMangaTags,
    staleTime: Infinity,
  });

  const genreTags = tagsData?.data.filter((t) => t.attributes.group === "genre").slice(0, 24) ?? [];

  const browseFilters: Partial<SearchFilters> = {
    sortBy,
    order: "desc",
    ...(activeFilters.status.length ? { status: activeFilters.status } : {}),
    ...(activeFilters.tags.length ? { tags: activeFilters.tags } : {}),
  };

  const browseQuery = useInfiniteQuery({
    queryKey: ["browse", sortBy, query, activeFilters],
    queryFn: ({ pageParam = 0 }) => searchManga(query, browseFilters, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.length * 20;
      return loaded < last.total ? loaded : undefined;
    },
  });

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && browseQuery.hasNextPage && !browseQuery.isFetchingNextPage) {
          browseQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [browseQuery]);

  const allManga = browseQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const filterCount = activeFilters.status.length + activeFilters.tags.length;
  const activeSource = settings.sourceProviders.find((source) => source.id === settings.activeSourceId);

  const toggleStatus = (s: MangaStatus) =>
    setActiveFilters((f) => ({
      ...f,
      status: f.status.includes(s) ? f.status.filter((x) => x !== s) : [...f.status, s],
    }));

  const toggleTag = (tagId: string) =>
    setActiveFilters((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((x) => x !== tagId) : [...f.tags, tagId],
    }));

  const clearFilters = () => setActiveFilters({ status: [], tags: [] });

  const submitSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    addToHistory(trimmed);
    setHistory(getHistory());
    setQuery(trimmed);
    setShowDropdown(false);
  }, []);

  const dropdownItems = query
    ? history.filter((t) => t.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
    : history.slice(0, 5);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Browse" />

      {/* Inline search bar with history/autocomplete dropdown */}
      <div className="px-4 py-2 border-b border-border relative">
        <div className="relative flex items-center bg-elevated rounded-full px-4 h-9 gap-2">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch(query);
              if (e.key === "Escape") setShowDropdown(false);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setShowDropdown(false)}
            placeholder="Search manga..."
            aria-label="Search manga"
            className="flex-1 bg-transparent text-text text-sm placeholder:text-text-muted outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowDropdown(false); }}
              aria-label="Clear search"
              className="text-text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {showDropdown && dropdownItems.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
            {dropdownItems.map((term) => (
              <div
                key={term}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-elevated transition-colors"
              >
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    submitSearch(term);
                  }}
                  className="flex items-center gap-2 flex-1 text-sm text-text text-left min-w-0"
                >
                  <Clock size={13} className="text-text-muted shrink-0" />
                  <span className="truncate">{term}</span>
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const updated = removeFromHistory(term);
                    setHistory(updated);
                  }}
                  aria-label={`Remove ${term} from history`}
                  className="text-text-muted hover:text-text shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <div className="border-t border-border px-3 py-2 flex justify-end">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearHistory();
                  setHistory([]);
                }}
                className="text-text-muted text-xs hover:text-text transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sort tabs + filter button */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto border-b border-[var(--border)]">
        <a href="/sources" className="chip shrink-0">
          <Database size={12} className="mr-1" />
          {activeSource?.name ?? "MangaDex"}
        </a>
        {SORT_OPTIONS.slice(0, 3).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setSortBy(key); setQuery(""); }}
            className={cn("chip shrink-0", sortBy === key && !query && "active")}
          >
            <span className="mr-1 text-[11px]">{icon}</span>
            {label}
          </button>
        ))}
        {query && (
          <button className="chip active shrink-0">
            <Search size={12} className="mr-1" />
            &ldquo;{query}&rdquo;
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setFiltersOpen(true)}
          className={cn("chip shrink-0", filterCount > 0 && "active")}
        >
          <Filter size={12} className="mr-1" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1.5 bg-white/30 rounded-full text-[10px] px-1.5 font-bold leading-4">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter pills */}
      {filterCount > 0 && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-[var(--border-subtle)]">
          {activeFilters.status.map((s) => (
            <button key={s} onClick={() => toggleStatus(s)} className="chip active text-xs capitalize flex items-center gap-1 shrink-0">
              {s} <X size={10} />
            </button>
          ))}
          {activeFilters.tags.map((tagId) => {
            const tag = genreTags.find((t) => t.id === tagId);
            return tag ? (
              <button key={tagId} onClick={() => toggleTag(tagId)} className="chip active text-xs flex items-center gap-1 shrink-0">
                {tag.attributes.name.en || Object.values(tag.attributes.name)[0]}
                <X size={10} />
              </button>
            ) : null;
          })}
          <button onClick={clearFilters} className="chip text-xs text-red-400 shrink-0">
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {browseQuery.isLoading ? (
        <SkeletonGrid count={12} />
      ) : !allManga.length ? (
        <EmptyState
          icon={<Search size={48} />}
          title="No results"
          description={query ? `No manga found for "${query}"` : "Try adjusting your filters"}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 fade-in">
          {allManga.map((manga) => (
            <BrowseMangaCard
              key={manga.id}
              id={manga.id}
              title={getMangaTitle(manga)}
              coverUrl={getMangaCoverUrl(manga, "256")}
              inLibrary={isInLibrary(manga.id)}
              status={manga.attributes.status}
            />
          ))}
        </div>
      )}

      {/* Load more sentinel */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
        {browseQuery.isFetchingNextPage && <Spinner size={24} style={{ color: "var(--primary)" }} />}
      </div>

      {/* Filter sheet */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-[var(--bg-surface)] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="sticky top-0 bg-[var(--bg-surface)] px-5 pt-4 pb-3 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-[var(--text)] font-semibold">Filters</h3>
              <div className="flex items-center gap-3">
                {filterCount > 0 && (
                  <button onClick={clearFilters} className="text-red-400 text-sm font-medium">
                    Clear
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="p-1 rounded-full hover:bg-[var(--bg-elevated)]">
                  <X size={20} className="text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Sort */}
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-2.5 uppercase tracking-wide font-medium">Sort by</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); }}
                      className={cn("chip", sortBy === key && "active")}
                    >
                      <span className="mr-1">{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-2.5 uppercase tracking-wide font-medium">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={cn("chip capitalize", activeFilters.status.includes(s) && "active")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              {genreTags.length > 0 && (
                <div>
                  <p className="text-[var(--text-secondary)] text-xs mb-2.5 uppercase tracking-wide font-medium">Genre</p>
                  <div className="flex flex-wrap gap-2">
                    {genreTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={cn("chip", activeFilters.tags.includes(tag.id) && "active")}
                      >
                        {tag.attributes.name.en || Object.values(tag.attributes.name)[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
