"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { getAllDownloads, deleteDownload, getTotalDownloadSize } from "@/lib/db";
import { readerHref } from "@/lib/routes";
import { HardDrive, Trash2, BookOpen } from "lucide-react";
import type { DownloadedChapter } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  const load = async () => {
    const [all, size] = await Promise.all([getAllDownloads(), getTotalDownloadSize()]);
    setDownloads(all);
    setTotalSize(size);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (chapterId: string) => {
    await deleteDownload(chapterId);
    setDownloads((prev) => prev.filter((d) => d.chapterId !== chapterId));
    const newSize = await getTotalDownloadSize();
    setTotalSize(newSize);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Downloads" />

      {loading ? (
        <PageSpinner />
      ) : downloads.length === 0 ? (
        <EmptyState
          icon={<HardDrive size={56} />}
          title="No downloads"
          description="Download chapters from any manga to read offline"
          action={
            <Link href="/browse" className="text-[var(--primary)] text-sm font-medium">
              Browse Manga
            </Link>
          }
        />
      ) : (
        <>
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
            <HardDrive size={14} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] text-xs">
              {downloads.length} chapter{downloads.length !== 1 ? "s" : ""} · {formatBytes(totalSize)} used
            </span>
          </div>
          <div className="flex flex-col">
            {downloads.map((dl) => (
              <DownloadItem
                key={dl.chapterId}
                download={dl}
                onDelete={() => handleDelete(dl.chapterId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DownloadItem({ download, onDelete }: { download: DownloadedChapter; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
      {download.coverUrl ? (
        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-card)]">
          <img src={download.coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-16 rounded-lg shrink-0 bg-[var(--bg-card)] flex items-center justify-center">
          <HardDrive size={20} className="text-[var(--text-muted)]" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {download.mangaTitle && (
          <p className="text-[var(--text)] font-medium text-sm line-clamp-1">{download.mangaTitle}</p>
        )}
        <p className="text-[var(--text-secondary)] text-xs mt-0.5">
          {download.chapterNum ? `Chapter ${download.chapterNum}` : "Chapter"} · {download.pages.length} pages
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-0.5">{formatBytes(download.size)}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link href={readerHref(download.mangaId, download.chapterId)}>
          <button className="p-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors">
            <BookOpen size={18} />
          </button>
        </Link>
        <button
          onClick={onDelete}
          className="p-2 rounded-full hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
