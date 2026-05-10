"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { db } from "@/lib/db";
import type { LibraryManga } from "@/types";

interface StatsData {
  chaptersRead: number;
  pagesRead: number;
  streak: number;
  mostReadTitle: string;
  librarySize: number;
  dailyActivity: DayActivity[];
}

interface DayActivity {
  label: string; // e.g. "M", "T"
  dateStr: string; // e.g. "5/1"
  count: number;
}

const DAY_ABBR: readonly string[] = ["S", "M", "T", "W", "T", "F", "S"];

function floorToDay(ts: number): number {
  return Math.floor(ts / 86_400_000);
}

async function computeStats(): Promise<StatsData> {
  const [allProgress, allHistory, librarySize] = await Promise.all([
    db.progress.toArray(),
    db.history.toArray(),
    db.library.count(),
  ]);

  // 1. Chapters read
  const chaptersRead = allProgress.filter((p) => p.completed).length;

  // 2. Pages read
  const pagesRead = allProgress.reduce((sum, p) => sum + (p.completed ? p.totalPages : p.page), 0);

  // 3. Reading streak — consecutive days ending today (or including today)
  const todayDay = floorToDay(Date.now());
  const historyDays = new Set(allHistory.map((h) => floorToDay(h.readAt)));
  let streak = 0;
  if (historyDays.has(todayDay)) {
    let d = todayDay;
    while (historyDays.has(d)) {
      streak++;
      d--;
    }
  }

  // 4. Most read this week — group history from last 7 days by mangaId
  const weekAgoTs = Date.now() - 7 * 86_400_000;
  const weekHistory = allHistory.filter((h) => h.readAt >= weekAgoTs);
  const mangaIdCounts = new Map<string, number>();
  for (const h of weekHistory) {
    mangaIdCounts.set(h.mangaId, (mangaIdCounts.get(h.mangaId) ?? 0) + 1);
  }

  let mostReadMangaId: string | null = null;
  let mostReadCount = 0;
  for (const [id, count] of mangaIdCounts) {
    if (count > mostReadCount) {
      mostReadCount = count;
      mostReadMangaId = id;
    }
  }

  let mostReadTitle = "—";
  if (mostReadMangaId !== null) {
    // Try to find title from history entries first (always present)
    const entry = weekHistory.find((h) => h.mangaId === mostReadMangaId);
    mostReadTitle = entry?.mangaTitle ?? "—";
    // Then try library for a potentially more accurate title
    const libEntry: LibraryManga | undefined = await db.library.get(mostReadMangaId);
    if (libEntry?.title) mostReadTitle = libEntry.title;
  }

  // 5. Daily activity for last 14 days
  const dailyActivity: DayActivity[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayTs = (todayDay - i) * 86_400_000;
    const dayDay = todayDay - i;
    const date = new Date(dayTs);
    const label = DAY_ABBR[date.getDay()];
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const count = allHistory.filter((h) => floorToDay(h.readAt) === dayDay).length;
    dailyActivity.push({ label, dateStr, count });
  }

  return { chaptersRead, pagesRead, streak, mostReadTitle, librarySize, dailyActivity };
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    computeStats()
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Reading Stats" backHref="/settings" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : stats !== null ? (
        <div className="flex flex-col gap-4 p-4 pb-8">
          <StatGrid stats={stats} />
          <ActivityChart dailyActivity={stats.dailyActivity} />
          <MostReadCard title={stats.mostReadTitle} />
        </div>
      ) : null}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div
      className="w-9 h-9 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin"
      role="status"
      aria-label="Loading statistics"
    />
  );
}

function StatGrid({ stats }: { stats: StatsData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Chapters Read" value={stats.chaptersRead.toLocaleString()} />
      <StatCard label="Pages Read" value={stats.pagesRead.toLocaleString()} />
      <StatCard label="Day Streak" value={stats.streak === 0 ? "—" : `${stats.streak}d`} />
      <StatCard label="In Library" value={stats.librarySize.toLocaleString()} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl p-4">
      <p className="text-[var(--text-secondary)] text-xs">{label}</p>
      <p className="text-[var(--text)] font-bold text-2xl mt-1 leading-tight">{value}</p>
    </div>
  );
}

function ActivityChart({ dailyActivity }: { dailyActivity: DayActivity[] }) {
  const maxCount = Math.max(...dailyActivity.map((d) => d.count), 1);
  const MAX_HEIGHT = 48;

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl p-4">
      <p className="text-[var(--text-secondary)] text-xs font-semibold mb-3">Daily Activity (14 days)</p>
      <div className="flex items-end gap-1 h-14" role="img" aria-label="Daily reading activity chart">
        {dailyActivity.map((day, idx) => {
          const barHeight =
            day.count === 0
              ? 0
              : Math.max(2, Math.round((day.count / maxCount) * MAX_HEIGHT));
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1 flex-1"
              title={`${day.dateStr}: ${day.count} chapter${day.count !== 1 ? "s" : ""}`}
            >
              <div className="flex flex-col justify-end" style={{ height: `${MAX_HEIGHT}px` }}>
                <div
                  className="bg-[var(--primary)] opacity-70 rounded-t w-full"
                  style={{ height: barHeight > 0 ? `${barHeight}px` : "0px" }}
                />
              </div>
              <span className="text-[var(--text-muted)] text-[9px] leading-none">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MostReadCard({ title }: { title: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl p-4">
      <p className="text-[var(--text-secondary)] text-xs font-semibold mb-1">Most Read This Week</p>
      <p className="text-[var(--text)] font-bold text-lg leading-snug line-clamp-2">
        {title}
      </p>
    </div>
  );
}
