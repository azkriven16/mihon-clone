"use client";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { getManga, getMangaChapters, getChapterPages, buildPageUrl } from "@/lib/api/mangadex";
import {
  getMangaTitle, getMangaCoverUrl, getChapterLabel,
  type Chapter, type MangaAuthor,
} from "@/types";
import { useLibrary } from "@/lib/store/library";
import { formatDate, statusColor, statusLabel, cn } from "@/lib/utils";
import { SkeletonDetail } from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BookmarkPlus, BookmarkMinus, BookOpen, ChevronDown, ChevronUp, ExternalLink, DownloadCloud, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { getReadChapterIds, downloadChapter as saveDownload, deleteDownload, getDownloadedChapterIds } from "@/lib/db";
import { useSettings } from "@/lib/store/settings";
import { readerHref } from "@/lib/routes";

export function MangaDetailView({ id }: { id: string }) {
  const addManga = useLibrary((s) => s.addManga);
  const removeManga = useLibrary((s) => s.removeManga);
  const loadLibrary = useLibrary((s) => s.loadLibrary);
  const inLibrary = useLibrary((s) => s.manga.some((m) => m.id === id));
  const { settings } = useSettings();
  const [descExpanded, setDescExpanded] = useState(false);
  const [addingToLib, setAddingToLib] = useState(false);
  const [libError, setLibError] = useState<string | null>(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<Record<string, number>>({});

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  const { data: mangaRes, isLoading: mangaLoading } = useQuery({
    queryKey: ["manga", id],
    queryFn: () => getManga(id),
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersTotal, setChaptersTotal] = useState(0);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const loadChapters = useCallback(async (offset: number) => {
    setChaptersLoading(true);
    try {
      const res = await getMangaChapters(id, offset, 100);
      setChaptersTotal(res.total);
      setChapters((prev) => offset === 0 ? res.data : [...prev, ...res.data]);
    } finally {
      setChaptersLoading(false);
    }
  }, [id]);

  const manga = mangaRes?.data;

  useEffect(() => {
    if (mangaRes) {
      loadChapters(0);
    }
  }, [mangaRes, loadChapters]);

  useEffect(() => {
    if (!chapters.length) return;
    getReadChapterIds(id, chapters.map((c) => c.id)).then(setReadChapters);
  }, [id, chapters]);

  useEffect(() => {
    getDownloadedChapterIds(id).then(setDownloadedIds);
  }, [id]);

  const handleLibraryToggle = async () => {
    if (!manga) return;
    setAddingToLib(true);
    setLibError(null);
    try {
      if (inLibrary) {
        await removeManga(id);
      } else {
        await addManga(manga, chaptersTotal || undefined);
      }
    } catch (err) {
      setLibError(err instanceof Error ? err.message : "Failed to update library");
    } finally {
      setAddingToLib(false);
    }
  };

  const handleDownload = useCallback(async (chapter: Chapter, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloadedIds.has(chapter.id)) {
      await deleteDownload(chapter.id);
      setDownloadedIds((prev) => { const s = new Set(prev); s.delete(chapter.id); return s; });
      return;
    }

    setDownloading((prev) => ({ ...prev, [chapter.id]: 0 }));
    try {
      const pagesData = await getChapterPages(chapter.id);
      const quality = settings.reader.dataSaver ? pagesData.chapter.dataSaver : pagesData.chapter.data;
      const urls = quality.map((f) => buildPageUrl(pagesData.baseUrl, pagesData.chapter.hash, f, settings.reader.dataSaver));
      await saveDownload(
        chapter.id,
        id,
        urls,
        {
          chapterNum: chapter.attributes.chapter,
          mangaTitle: manga ? getMangaTitle(manga) : undefined,
          coverUrl: manga ? getMangaCoverUrl(manga, "256") : undefined,
        },
        (loaded, total) => setDownloading((prev) => ({ ...prev, [chapter.id]: Math.round((loaded / total) * 100) }))
      );
      setDownloadedIds((prev) => new Set([...prev, chapter.id]));
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading((prev) => { const n = { ...prev }; delete n[chapter.id]; return n; });
    }
  }, [downloadedIds, id, manga, settings.reader.dataSaver]);

  if (mangaLoading) return (
    <div className="min-h-full">
      <div className="flex items-center gap-2 p-3 sticky top-0 z-40 glass border-b border-[var(--border)]">
        <Link href="/browse" className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text)]">
          <ArrowLeft size={22} />
        </Link>
        <div className="skeleton h-5 w-32 rounded" />
      </div>
      <SkeletonDetail />
    </div>
  );

  if (!manga) return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
      Manga not found
    </div>
  );

  const title = getMangaTitle(manga);
  const coverUrl = getMangaCoverUrl(manga, "512");
  const description = manga.attributes.description.en || manga.attributes.description[Object.keys(manga.attributes.description)[0]] || "";
  const authors = manga.relationships.filter((r) => r.type === "author") as MangaAuthor[];
  const tags = manga.attributes.tags.filter((t) => t.attributes.group === "genre").slice(0, 6);
  const firstUnread = chapters.find((c) => !readChapters.has(c.id));
  const firstChapter = chapters[chapters.length - 1];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-[var(--border)] flex items-center h-14 px-2 gap-1">
        <Link href="/browse" className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text)]">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="flex-1 text-[var(--text)] font-bold text-base px-1 truncate">{title}</h1>
      </div>

      {/* Hero */}
      <div className="relative">
        {/* Background blur */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover blur-2xl scale-110 opacity-30"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/50 via-transparent to-[var(--bg)]" />
        </div>

        <div className="relative flex gap-4 p-4 pt-6">
          <div className="relative w-28 h-40 rounded-[var(--radius)] overflow-hidden shadow-xl shrink-0">
            <Image src={coverUrl} alt={title} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 flex flex-col justify-end gap-2">
            <h2 className="text-[var(--text)] font-bold text-lg leading-tight line-clamp-3">{title}</h2>
            {authors.length > 0 && (
              <p className="text-[var(--text-secondary)] text-sm">
                {authors.map((a) => a.attributes?.name).join(", ")}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold uppercase", statusColor(manga.attributes.status))}>
                ● {statusLabel(manga.attributes.status)}
              </span>
              <span className="text-[var(--text-muted)] text-xs">
                {chaptersTotal || "—"} chapters
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex flex-col gap-2 px-4 pb-4">
          <div className="flex gap-2">
          <Button
            variant={inLibrary ? "secondary" : "primary"}
            size="md"
            className="flex-1"
            onClick={handleLibraryToggle}
            loading={addingToLib}
          >
            {inLibrary ? <BookmarkMinus size={16} /> : <BookmarkPlus size={16} />}
            {inLibrary ? "In Library" : "Add to Library"}
          </Button>
          {(firstUnread || firstChapter) && (
            <Link href={readerHref(id, (firstUnread || firstChapter)!.id)} className="flex-1">
              <Button variant="secondary" size="md" fullWidth>
                <BookOpen size={16} />
                {firstUnread && readChapters.size > 0 ? "Continue" : "Read"}
              </Button>
            </Link>
          )}
          </div>
          {libError && (
            <p className="text-danger text-xs text-center">{libError}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {tags.map((tag) => (
            <span key={tag.id} className="chip text-xs shrink-0">
              {tag.attributes.name.en || Object.values(tag.attributes.name)[0]}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="px-4 pb-4">
          <p className={cn("text-[var(--text-secondary)] text-sm leading-relaxed", !descExpanded && "line-clamp-3")}>
            {description}
          </p>
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="text-[var(--primary)] text-xs font-medium mt-1 flex items-center gap-0.5"
          >
            {descExpanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> More</>}
          </button>
        </div>
      )}

      {/* Chapter list */}
      <div className="flex-1 border-t border-[var(--border)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-[var(--text)] font-semibold text-sm">
            {chaptersLoading ? "Loading chapters..." : `${chapters.length} Chapters`}
          </h3>
        </div>

        {chaptersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size={28} style={{ color: "var(--primary)" }} />
          </div>
        ) : chapters.length === 0 ? (
          <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
            No chapters available in English
          </div>
        ) : (
          <div className="flex flex-col">
            {chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                mangaId={id}
                isRead={readChapters.has(chapter.id)}
                isDownloaded={downloadedIds.has(chapter.id)}
                downloadProgress={downloading[chapter.id]}
                onDownload={(e) => handleDownload(chapter, e)}
              />
            ))}
            {chapters.length < chaptersTotal && (
              <button
                onClick={() => loadChapters(chapters.length)}
                disabled={chaptersLoading}
                className="mx-4 my-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
              >
                {chaptersLoading ? (
                  <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Load ${Math.min(100, chaptersTotal - chapters.length)} more chapters`
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterItem({
  chapter, mangaId, isRead, isDownloaded, downloadProgress, onDownload,
}: {
  chapter: Chapter; mangaId: string; isRead: boolean;
  isDownloaded: boolean; downloadProgress?: number;
  onDownload: (e: React.MouseEvent) => void;
}) {
  const group = chapter.relationships.find((r) => r.type === "scanlation_group");
  const groupName = group?.attributes?.name;
  const isExternal = !!chapter.attributes.externalUrl;

  const inner = (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <p className={cn("text-sm font-medium truncate", isRead ? "text-[var(--text-muted)]" : "text-[var(--text)]")}>
          {getChapterLabel(chapter)}
        </p>
        {isExternal && <ExternalLink size={12} className="text-[var(--text-muted)] shrink-0" />}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[var(--text-muted)] text-xs">{formatDate(chapter.attributes.publishAt)}</span>
        {groupName && <span className="text-[var(--text-muted)] text-xs truncate">· {groupName}</span>}
        {isExternal && <span className="text-[var(--text-muted)] text-xs">· external</span>}
      </div>
    </div>
  );

  const downloadBtn = !isExternal && (
    <button
      onClick={onDownload}
      className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] shrink-0 transition-colors"
      title={isDownloaded ? "Delete download" : "Download chapter"}
    >
      {downloadProgress !== undefined ? (
        <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      ) : isDownloaded ? (
        <CheckCircle2 size={16} className="text-[var(--accent)]" />
      ) : (
        <DownloadCloud size={16} className="text-[var(--text-muted)]" />
      )}
    </button>
  );

  const rowClass = cn(
    "flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors",
    isRead && "opacity-50"
  );

  if (isExternal && chapter.attributes.externalUrl) {
    return (
      <a href={chapter.attributes.externalUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {inner}
        <ExternalLink size={14} className="text-[var(--text-muted)] shrink-0" />
      </a>
    );
  }

  return (
    <Link href={readerHref(mangaId, chapter.id)} className={rowClass}>
      {inner}
      {isRead && <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] shrink-0" />}
      {downloadBtn}
    </Link>
  );
}
