"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLibrary } from "@/lib/store/library";
import { getMangaChapters } from "@/lib/api/mangadex";
import { formatDate } from "@/lib/utils";
import { readerHref } from "@/lib/routes";
import { RefreshCw, BookOpen, CheckCircle2 } from "lucide-react";
import type { Chapter, LibraryManga } from "@/types";
import { UPDATES_BADGE_KEY, UPDATES_LAST_SEEN_KEY } from "@/lib/hooks/useUpdatesBadge";

interface UpdateEntry {
  manga: LibraryManga;
  chapter: Chapter;
  isNew: boolean;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "This week";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

function writeBadge(count: number): void {
  localStorage.setItem(UPDATES_BADGE_KEY, String(count));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: UPDATES_BADGE_KEY,
      newValue: String(count),
      storageArea: localStorage,
    })
  );
}

export default function UpdatesPage() {
  const { manga, loadLibrary } = useLibrary();
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const lastSeenRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(UPDATES_LAST_SEEN_KEY);
    lastSeenRef.current = stored ? parseInt(stored, 10) || 0 : 0;
    localStorage.setItem(UPDATES_LAST_SEEN_KEY, String(Date.now()));
    writeBadge(0);
  }, []);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  const fetchUpdates = async () => {
    if (!manga.length) return;
    setLoading(true);
    const results: UpdateEntry[] = [];

    await Promise.allSettled(
      manga.slice(0, 20).map(async (m) => {
        const res = await getMangaChapters(m.id, 0, 1);
        if (res.data.length) {
          const chapter = res.data[0];
          const isNew =
            !m.lastReadAt ||
            new Date(chapter.attributes.publishAt).getTime() > m.lastReadAt;
          results.push({ manga: m, chapter, isNew });
        }
      })
    );

    results.sort(
      (a, b) =>
        new Date(b.chapter.attributes.publishAt).getTime() -
        new Date(a.chapter.attributes.publishAt).getTime()
    );

    const lastSeen = lastSeenRef.current;
    if (lastSeen > 0) {
      const newCount = results.filter(
        ({ chapter }) =>
          new Date(chapter.attributes.publishAt).getTime() > lastSeen
      ).length;
      writeBadge(newCount);
    }

    setUpdates(results);
    setLoading(false);
    setFetched(true);
  };

  useEffect(() => {
    if (manga.length && !fetched) fetchUpdates();
  }, [manga.length, fetched]);

  const allCaughtUp = fetched && updates.length > 0 && updates.every((u) => !u.isNew);

  const grouped: Array<{ label: string; entries: UpdateEntry[] }> = [];
  if (updates.length > 0) {
    const map = new Map<string, UpdateEntry[]>();
    for (const entry of updates) {
      const label = getDateGroup(entry.chapter.attributes.publishAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(entry);
    }
    for (const label of GROUP_ORDER) {
      const entries = map.get(label);
      if (entries?.length) grouped.push({ label, entries });
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Updates"
        actions={
          <button
            onClick={fetchUpdates}
            className="p-2 rounded-full hover:bg-elevated transition-colors text-text-secondary"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {loading ? (
        <PageSpinner />
      ) : manga.length === 0 ? (
        <EmptyState
          icon={<RefreshCw size={56} />}
          title="Library is empty"
          description="Add manga to your library to see updates"
          action={
            <Link href="/browse" className="text-primary text-sm font-medium">
              Browse Manga
            </Link>
          }
        />
      ) : allCaughtUp ? (
        <EmptyState
          icon={<CheckCircle2 size={56} className="text-green-400" />}
          title="You're all caught up!"
          description="No new chapters since your last read"
          action={
            <button
              onClick={fetchUpdates}
              className="text-primary text-sm font-medium"
            >
              Refresh
            </button>
          }
        />
      ) : updates.length === 0 ? (
        <EmptyState
          icon={<RefreshCw size={56} />}
          title="No updates yet"
          description="Pull to check for new chapters"
          action={
            <button onClick={fetchUpdates} className="text-primary text-sm font-medium">
              Check now
            </button>
          }
        />
      ) : (
        <div className="flex flex-col">
          {grouped.map(({ label, entries }) => (
            <div key={label}>
              <div className="sticky top-0 z-10 px-4 py-1.5 bg-(--bg-base) border-b border-(--border-subtle)">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {label}
                </span>
              </div>
              {entries.map(({ manga: m, chapter, isNew }) => (
                <UpdateItem key={chapter.id} manga={m} chapter={chapter} isNew={isNew} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface UpdateItemProps extends UpdateEntry {}

function UpdateItem({ manga, chapter, isNew }: UpdateItemProps) {
  return (
    <Link
      href={readerHref(manga.id, chapter.id)}
      className="flex items-center gap-3 px-4 py-3 border-b border-(--border-subtle) hover:bg-surface transition-colors"
    >
      <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-card">
        <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-text font-medium text-sm line-clamp-1">{manga.title}</p>
          {isNew && (
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full shrink-0">
              NEW
            </span>
          )}
        </div>
        <p className="text-text-secondary text-xs mt-0.5">
          {chapter.attributes.chapter ? `Ch.${chapter.attributes.chapter}` : ""}
          {chapter.attributes.title ? ` - ${chapter.attributes.title}` : ""}
        </p>
        <p className="text-text-muted text-xs mt-0.5">
          {formatDate(chapter.attributes.publishAt)}
        </p>
      </div>
      <BookOpen size={16} className="text-text-muted shrink-0" />
    </Link>
  );
}
