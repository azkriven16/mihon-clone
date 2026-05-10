"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getChapterPages, buildPageUrl, getMangaChapters, getChapter } from "@/lib/api/mangadex";
import { useSettings } from "@/lib/store/settings";
import { saveProgress, markChapterRead, getProgress, addToHistory, refreshUnreadCount, getDownloadedPages } from "@/lib/db";
import { ExternalLink, WifiOff } from "lucide-react";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Settings2,
  AlignJustify, BookOpen, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMangaTitle, getMangaCoverUrl } from "@/types";
import type { ReaderMode, Manga, MangaDexSingleResponse } from "@/types";
import { mangaHref, readerHref } from "@/lib/routes";
import { useWindowTitle } from "@/lib/hooks/useWindowTitle";
import { isDesktopRuntime } from "@/lib/desktop";

interface PanOffset {
  x: number;
  y: number;
}

export function ReaderView({ mangaId, chapterId }: { mangaId: string; chapterId: string }) {
  const { settings, setReaderMode, setPageFit } = useSettings();
  const queryClient = useQueryClient();
  const { reader } = settings;
  const [currentPage, setCurrentPage] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [resumedPage, setResumedPage] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // null = checking, false = no offline, string[] = offline pages available
  const [offlinePages, setOfflinePages] = useState<string[] | false | null>(null);

  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });

  const offlineUrlsRef = useRef<string[]>([]);
  const webtoonContainerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const saveProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zoom and pan refs
  const zoomStartRef = useRef<number>(1);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const { data: chapterMeta } = useQuery({
    queryKey: ["chapter-meta", chapterId],
    queryFn: () => getChapter(chapterId),
    staleTime: Infinity,
  });

  const externalUrl = chapterMeta?.data?.attributes?.externalUrl;

  const {
    data: pagesData,
    isLoading: pagesLoading,
    isError: pagesError,
    refetch,
  } = useQuery({
    queryKey: ["chapter-pages", chapterId],
    queryFn: () => getChapterPages(chapterId),
    staleTime: Infinity,
    retry: 2,
    // Don't fetch if it's an external chapter (we already know there are no pages)
    enabled: externalUrl === undefined || externalUrl === null,
  });

  const { data: chaptersData } = useQuery({
    queryKey: ["chapters", mangaId],
    queryFn: () => getMangaChapters(mangaId, 0, 100),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setIsDesktop(isDesktopRuntime());
  }, []);

  // Check IndexedDB for offline pages on mount; revoke object URLs on unmount
  useEffect(() => {
    getDownloadedPages(chapterId).then((urls) => {
      if (urls) {
        offlineUrlsRef.current = urls;
        setOfflinePages(urls);
      } else {
        setOfflinePages(false);
      }
    });
    return () => {
      offlineUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      offlineUrlsRef.current = [];
    };
  }, [chapterId]);

  const hasOffline = Array.isArray(offlinePages);
  const isCheckingOffline = offlinePages === null;

  const pages = hasOffline
    ? offlinePages
    : pagesData
    ? (reader.dataSaver ? pagesData.chapter.dataSaver : pagesData.chapter.data).map((f) =>
        buildPageUrl(pagesData.baseUrl, pagesData.chapter.hash, f, reader.dataSaver)
      )
    : [];

  const totalPages = pages.length;
  const chapters = chaptersData?.data ?? [];
  const chapterIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
  const currentChapter = chapters[chapterIndex];

  useWindowTitle(currentChapter ? `Ch.${currentChapter.attributes.chapter ?? "?"} — Mihon` : "Mihon");

  const handleExternalOpen = useCallback(async (url: string) => {
    if (isDesktopRuntime()) {
      try {
        // Cast to string so TypeScript treats this as a dynamic (non-literal)
        // import expression and does not attempt to resolve the module at
        // compile time. @tauri-apps/plugin-shell is an optional Tauri plugin
        // that may not be installed; the catch block handles the fallback.
        const pkg = "@tauri-apps/plugin-shell" as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { open } = await import(/* @vite-ignore */ pkg as any);
        await open(url);
      } catch {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  // Restore progress
  useEffect(() => {
    if (totalPages === 0) return;
    getProgress(chapterId).then((p) => {
      if (p && !p.completed && p.page > 0) {
        const page = Math.min(p.page, totalPages - 1);
        setCurrentPage(page);
        setResumedPage(page);
        if (resumeToastTimerRef.current) clearTimeout(resumeToastTimerRef.current);
        resumeToastTimerRef.current = setTimeout(() => setResumedPage(null), 2500);
      }
    });
    return () => {
      if (resumeToastTimerRef.current) clearTimeout(resumeToastTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, totalPages]);

  // Save progress + history, refresh unread count on completion (debounced 800ms)
  useEffect(() => {
    if (!totalPages) return;
    if (saveProgressTimerRef.current) clearTimeout(saveProgressTimerRef.current);
    saveProgressTimerRef.current = setTimeout(() => {
      const completed = currentPage >= totalPages - 1;
      const now = Date.now();
      saveProgress({ chapterId, page: currentPage, totalPages, completed, readAt: now });

      if (currentChapter) {
        const cachedManga = queryClient.getQueryData<MangaDexSingleResponse<Manga>>(["manga", mangaId]);
        addToHistory({
          chapterId,
          mangaId,
          mangaTitle: cachedManga ? getMangaTitle(cachedManga.data) : "Unknown",
          chapterNum: currentChapter.attributes.chapter,
          chapterTitle: currentChapter.attributes.title,
          coverUrl: cachedManga ? getMangaCoverUrl(cachedManga.data, "256") : "/placeholder.png",
          readAt: now,
          page: currentPage,
          totalPages,
        });
      }

      if (completed) {
        markChapterRead(chapterId, totalPages);
        const chapterIds = chapters.map((c) => c.id);
        if (chapterIds.length) refreshUnreadCount(mangaId, chapterIds);
      }
    }, 800);
    return () => {
      if (saveProgressTimerRef.current) clearTimeout(saveProgressTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, currentPage, totalPages]);

  // Reset image load state and zoom when page changes
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [currentPage]);

  // Save webtoon scroll position + progress (debounced, 800ms)
  useEffect(() => {
    if (reader.mode !== "webtoon" || totalPages === 0) return;
    const el = webtoonContainerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem(`webtoon_scroll_${chapterId}`, String(el.scrollTop));
        const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
        const pageIndex = Math.min(Math.floor(scrollRatio * totalPages), totalPages - 1);
        const completed = pageIndex >= totalPages - 1;
        saveProgress({ chapterId, page: pageIndex, totalPages, completed, readAt: Date.now() });
      }, 800);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [chapterId, reader.mode, totalPages]);

  // Restore webtoon scroll position after pages load
  useEffect(() => {
    if (reader.mode !== "webtoon" || !pages.length) return;
    const el = webtoonContainerRef.current;
    if (!el) return;
    const saved = localStorage.getItem(`webtoon_scroll_${chapterId}`);
    if (saved) {
      const t = setTimeout(() => { el.scrollTop = Number(saved); }, 100);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    getProgress(chapterId).then((p) => {
      if (cancelled || !p || p.completed || p.page === 0) return;
      const t = setTimeout(() => {
        const imgEls = el.querySelectorAll("img");
        const target: HTMLImageElement | undefined = imgEls[p.page];
        if (target) {
          target.scrollIntoView();
        } else {
          const estimatedHeight = el.scrollHeight / pages.length;
          el.scrollTop = p.page * estimatedHeight;
        }
      }, 150);
      return () => clearTimeout(t);
    });
    return () => { cancelled = true; };
  }, [chapterId, reader.mode, pages]);

  // Auto-hide UI
  const showUI = useCallback(() => {
    setUiVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setUiVisible(false), 3500);
  }, []);

  useEffect(() => {
    showUI();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [showUI]);

  const isDouble = reader.mode === "double";
  const step = isDouble ? 2 : 1;

  const goToPrev = useCallback(() => {
    setCurrentPage((p) =>
      reader.direction === "rtl" ? Math.min(p + step, totalPages - 1) : Math.max(p - step, 0)
    );
  }, [reader.direction, totalPages, step]);

  const goToNext = useCallback(() => {
    setCurrentPage((p) =>
      reader.direction === "rtl" ? Math.max(p - step, 0) : Math.min(p + step, totalPages - 1)
    );
  }, [reader.direction, totalPages, step]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goToNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToNext, goToPrev]);

  const handleTap = useCallback((e: React.MouseEvent) => {
    const sidebarW = isDesktop ? 240 : 0;
    const contentWidth = window.innerWidth - sidebarW;
    const x = (e.clientX - sidebarW) / contentWidth;
    if (x < 0.3) goToPrev();
    else if (x > 0.7) goToNext();
    else showUI();
  }, [goToPrev, goToNext, showUI, isDesktop]);

  // Pinch-to-zoom handlers for non-webtoon modes
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (reader.mode === "webtoon") return;

    // Two-finger pinch: prepare for zoom
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.hypot(dx, dy);
      zoomStartRef.current = distance;
      return;
    }

    // Single touch: prepare for pan or swipe
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    if (scale > 1) {
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [reader.mode, scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (reader.mode === "webtoon") return;

    // Two-finger pinch zoom
    if (e.touches.length === 2 && scale <= 3) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const currentDistance = Math.hypot(dx, dy);

      if (zoomStartRef.current > 0) {
        const newScale = Math.max(1, Math.min(3, (currentDistance / zoomStartRef.current) * scale));
        setScale(newScale);
      }
      return;
    }

    // Single-finger pan when zoomed in
    if (e.touches.length === 1 && scale > 1 && panStartRef.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - panStartRef.current.x;
      const deltaY = touch.clientY - panStartRef.current.y;
      setPanOffset({ x: deltaX, y: deltaY });
    }
  }, [reader.mode, scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (reader.mode === "webtoon" || touchStartRef.current === null) return;

    // Reset zoom distance tracker
    zoomStartRef.current = 1;
    panStartRef.current = null;

    // If zoomed in, reset pan smoothly only if user "released"
    if (scale === 1) {
      setPanOffset({ x: 0, y: 0 });
    }

    // Handle swipe navigation only if not zoomed
    if (scale > 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) <= 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    const swipedLeft = deltaX < 0;
    if (reader.direction === "rtl") {
      if (swipedLeft) goToPrev();
      else goToNext();
    } else {
      if (swipedLeft) goToNext();
      else goToPrev();
    }
  }, [reader.mode, reader.direction, goToNext, goToPrev, scale]);

  const handleDoubleClick = useCallback(() => {
    if (reader.mode === "webtoon") return;
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [reader.mode]);

  const handleImageTap = useCallback((e: React.TouchEvent) => {
    if (reader.mode === "webtoon" || e.touches.length !== 1) return;

    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;

    if (isDoubleTap) {
      handleDoubleClick();
    }
  }, [reader.mode, handleDoubleClick]);

  const sidebarLeft = isDesktop ? "15rem" : "0";

  // ── External chapter ───────────────────────────────────────────────────
  if (externalUrl) {
    return (
      <div className="fixed inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ left: sidebarLeft }}>
        <Link href={mangaHref(mangaId)} className="absolute top-4 left-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft size={22} />
        </Link>
        <div className="text-4xl">🔗</div>
        <div>
          <p className="text-white font-semibold text-base">Hosted externally</p>
          <p className="text-white/50 text-sm mt-1 max-w-xs">
            This chapter is hosted on an external site and cannot be read here.
          </p>
        </div>
        <button
          onClick={() => handleExternalOpen(externalUrl)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-dim)] text-white rounded-full text-sm font-medium"
        >
          <ExternalLink size={15} />
          Open external site
        </button>
        <Link href={mangaHref(mangaId)} className="text-white/40 text-sm underline">
          Back to manga
        </Link>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (isCheckingOffline || (pagesLoading && !hasOffline)) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4" style={{ left: sidebarLeft }}>
        <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading chapter…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (!hasOffline && (pagesError || pages.length === 0)) {
    return (
      <div className="fixed inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ left: sidebarLeft }}>
        <Link href={mangaHref(mangaId)} className="absolute top-4 left-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft size={22} />
        </Link>
        <div className="text-4xl">📭</div>
        <div>
          <p className="text-white font-semibold text-base">Failed to load chapter</p>
          <p className="text-white/50 text-sm mt-1">
            {pagesError ? "Could not reach the manga server. Check your connection and try again." : "No pages found for this chapter."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-dim)] text-white rounded-full text-sm font-medium"
        >
          <RotateCcw size={15} />
          Retry
        </button>
        <Link href={mangaHref(mangaId)} className="text-white/40 text-sm underline">
          Back to manga
        </Link>
      </div>
    );
  }

  const isWebtoon = reader.mode === "webtoon";
  const isSingle = reader.mode === "single";
  const currentImg = pages[currentPage];

  // Double-page spread: page 0 alone (cover), then pairs
  const spread = isDouble
    ? (currentPage === 0 ? [0] : [currentPage, currentPage + 1].filter((i) => i < totalPages))
    : [];
  const spreadDisplay = reader.direction === "rtl" ? [...spread].reverse() : spread;

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: reader.backgroundColor || "#0d0d0d", left: sidebarLeft }}
      onClick={isSingle || isDouble ? handleTap : showUI}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top bar ── */}
      <div className={cn(
        "absolute top-0 inset-x-0 z-50 flex items-center h-14 px-2 gap-2 transition-all duration-300",
        "bg-gradient-to-b from-black/70 to-transparent",
        !uiVisible && "opacity-0 pointer-events-none -translate-y-2"
      )}>
        <Link
          href={mangaHref(mangaId)}
          className="p-2 rounded-full hover:bg-white/10 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0 px-1">
          <p className="text-white text-sm font-semibold truncate">
            {currentChapter
              ? `Ch.${currentChapter.attributes.chapter ?? "?"} ${currentChapter.attributes.title ? `– ${currentChapter.attributes.title}` : ""}`.trim()
              : "Loading…"}
          </p>
          <div className="flex items-center gap-1.5">
            {!isWebtoon && totalPages > 0 && reader.showPageNumber && (
              <p className="text-white/50 text-xs">{currentPage + 1} / {totalPages}</p>
            )}
            {hasOffline && (
              <span className="flex items-center gap-0.5 text-[10px] text-[var(--accent)] font-medium">
                <WifiOff size={10} /> offline
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen); }}
          className="p-2 rounded-full hover:bg-white/10 text-white"
        >
          <Settings2 size={20} />
        </button>
      </div>

      {/* ── Resume toast ── */}
      {resumedPage !== null && (
        <div className="absolute top-16 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-black/75 text-white text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
            Resumed from page {resumedPage + 1}
          </div>
        </div>
      )}

      {/* ── Brightness overlay ── */}
      {reader.brightness < 100 && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-black"
          style={{ opacity: (100 - reader.brightness) / 100 }}
        />
      )}

      {/* ── Pages ── */}
      {isWebtoon ? (
        <div
          ref={webtoonContainerRef}
          className="h-full overflow-y-auto overflow-x-hidden"
          style={{ paddingTop: 56, paddingBottom: 80 }}
          onClick={(e) => e.stopPropagation()}
        >
          {pages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Page ${i + 1}`}
              className={cn("w-full block", reader.pageFit === "contain" ? "max-w-2xl mx-auto" : "w-full")}
              loading={i < 3 ? "eager" : "lazy"}
            />
          ))}
        </div>
      ) : isDouble ? (
        /* ── Double-page spread ── */
        <div className="h-full w-full flex items-center justify-center gap-0.5">
          <div
            style={{
              transform: `scale(${scale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: "center",
              transition: scale === 1 ? "transform 0.2s ease-out" : "none",
            }}
          >
            <div className="h-full w-full flex items-center justify-center gap-0.5">
              {spreadDisplay.map((i) => (
                <img
                  key={i}
                  src={pages[i]}
                  alt={`Page ${i + 1}`}
                  className="h-full w-auto max-w-[50%] object-contain"
                  onDoubleClick={handleDoubleClick}
                  onTouchEnd={handleImageTap}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Single page ── */
        <div className="h-full w-full flex items-center justify-center relative">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
              <p className="text-white/50 text-sm">Failed to load page {currentPage + 1}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setImgError(false); setImgLoaded(false); }}
                className="text-[var(--primary)] text-sm flex items-center gap-1"
              >
                <RotateCcw size={13} /> Retry
              </button>
            </div>
          )}
          {currentImg && (
            <div
              style={{
                transform: `scale(${scale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: "center",
                transition: scale === 1 ? "transform 0.2s ease-out" : "none",
              }}
            >
              <img
                key={currentImg}
                src={currentImg}
                alt={`Page ${currentPage + 1}`}
                className={cn(
                  "max-h-full transition-opacity duration-200",
                  !imgLoaded ? "opacity-0" : "opacity-100",
                  reader.pageFit === "width" ? "w-full h-auto" :
                  reader.pageFit === "height" ? "h-full w-auto" :
                  "max-w-full max-h-full object-contain"
                )}
                onLoad={() => { setImgLoaded(true); setImgError(false); }}
                onError={() => { setImgLoaded(false); setImgError(true); }}
                onDoubleClick={handleDoubleClick}
                onTouchEnd={handleImageTap}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom controls (single + double mode) ── */}
      {(isSingle || isDouble) && totalPages > 0 && (
        <div className={cn(
          "absolute bottom-0 inset-x-0 z-50 px-4 py-4 flex items-center gap-3 transition-all duration-300",
          "bg-gradient-to-t from-black/70 to-transparent",
          !uiVisible && "opacity-0 pointer-events-none translate-y-2"
        )}>
          {prevChapter ? (
            <Link href={readerHref(mangaId, prevChapter.id)} onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-full text-white hover:bg-white/10">
                <ChevronLeft size={22} />
              </button>
            </Link>
          ) : (
            <div className="p-2 text-white/20"><ChevronLeft size={22} /></div>
          )}

          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/60 text-xs w-6 text-right tabular-nums">{currentPage + 1}</span>
            <input
              type="range"
              min={0}
              max={Math.max(totalPages - 1, 0)}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="flex-1 accent-[var(--primary)] h-1 cursor-pointer"
            />
            <span className="text-white/60 text-xs w-6 tabular-nums">{totalPages}</span>
          </div>

          {nextChapter ? (
            <Link href={readerHref(mangaId, nextChapter.id)} onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-full text-white hover:bg-white/10">
                <ChevronRight size={22} />
              </button>
            </Link>
          ) : (
            <div className="p-2 text-white/20"><ChevronRight size={22} /></div>
          )}
        </div>
      )}

      {/* ── Settings sheet ── */}
      {settingsOpen && (
        <div
          className="absolute inset-0 z-[60] flex items-end"
          onClick={(e) => { e.stopPropagation(); setSettingsOpen(false); }}
        >
          <div
            className="w-full rounded-t-2xl bg-[var(--bg-surface)] p-5 space-y-5 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto" />
            <h3 className="text-[var(--text)] font-semibold">Reader Settings</h3>

            <div>
              <p className="text-[var(--text-secondary)] text-xs mb-2 uppercase tracking-wide">Mode</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { mode: "single",  label: "Single",  icon: <BookOpen size={13} /> },
                  { mode: "double",  label: "Double",  icon: <BookOpen size={13} /> },
                  { mode: "webtoon", label: "Webtoon", icon: <AlignJustify size={13} /> },
                ] as { mode: ReaderMode; label: string; icon: React.ReactNode }[]).map(({ mode: m, label, icon }) => (
                  <button
                    key={m}
                    onClick={() => setReaderMode(m)}
                    className={cn("chip flex-1 justify-center gap-1", reader.mode === m && "active")}
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {(isSingle || isDouble) && (
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-2 uppercase tracking-wide">Page Fit</p>
                <div className="flex gap-2">
                  {(["width", "height", "contain"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPageFit(f)}
                      className={cn("chip flex-1 justify-center capitalize", reader.pageFit === f && "active")}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
          </div>
        </div>
      )}
    </div>
  );
}
