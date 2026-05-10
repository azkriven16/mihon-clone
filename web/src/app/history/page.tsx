"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getHistory, clearHistory } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { readerHref } from "@/lib/routes";
import { History, Trash2 } from "lucide-react";
import type { ReadingHistory } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const h = await getHistory(100);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleClear = async () => {
    if (!confirm("Clear all reading history?")) return;
    await clearHistory();
    setHistory([]);
  };

  // Group by date
  const grouped = history.reduce<Record<string, ReadingHistory[]>>((acc, item) => {
    const date = new Date(item.readAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="History"
        actions={
          history.length > 0 ? (
            <button
              onClick={handleClear}
              className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
            >
              <Trash2 size={20} />
            </button>
          ) : undefined
        }
      />

      {loading ? null : history.length === 0 ? (
        <EmptyState
          icon={<History size={56} />}
          title="No reading history"
          description="Start reading manga to see your history here"
        />
      ) : (
        <div className="flex flex-col">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-[var(--bg-surface)] sticky top-14 z-10">
                <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wide">
                  {date === new Date().toDateString() ? "Today" : date}
                </p>
              </div>
              {items.map((item) => (
                <HistoryItem key={item.chapterId} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ item }: { item: ReadingHistory }) {
  const progress = item.totalPages > 0
    ? Math.round((item.page / item.totalPages) * 100)
    : 0;

  return (
    <Link
      href={readerHref(item.mangaId, item.chapterId)}
      className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors"
    >
      <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-card)]">
        <img src={item.coverUrl} alt={item.mangaTitle} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text)] font-medium text-sm line-clamp-1">{item.mangaTitle}</p>
        <p className="text-[var(--text-secondary)] text-xs mt-0.5">
          {item.chapterNum ? `Ch.${item.chapterNum}` : "Chapter"}
          {item.chapterTitle ? ` - ${item.chapterTitle}` : ""}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[var(--text-muted)] text-xs shrink-0">{formatDate(item.readAt)}</span>
        </div>
      </div>
    </Link>
  );
}
