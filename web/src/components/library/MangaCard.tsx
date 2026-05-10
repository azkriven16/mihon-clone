"use client";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mangaHref } from "@/lib/routes";
import type { LibraryManga } from "@/types";

interface MangaCardProps {
  manga: LibraryManga;
  showUnread?: boolean;
}

export function MangaCard({ manga, showUnread }: MangaCardProps) {
  return (
    <Link href={mangaHref(manga.id)} className="group flex flex-col gap-1.5 select-none">
      <div className="relative aspect-3/4 rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)] shadow-md">
        <Image
          src={manga.coverUrl}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 160px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          unoptimized
        />
        {showUnread && manga.unreadCount > 0 && (
          <div className="absolute top-1.5 left-1.5 badge text-[10px] min-w-[20px] h-5">
            {manga.unreadCount > 99 ? "99+" : manga.unreadCount}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <p className="text-[var(--text)] text-xs font-medium line-clamp-2 leading-tight px-0.5">
        {manga.title}
      </p>
    </Link>
  );
}

interface BrowseMangaCardProps {
  id: string;
  title: string;
  coverUrl: string;
  inLibrary?: boolean;
  chaptersCount?: number;
  status?: string;
}

export function BrowseMangaCard({ id, title, coverUrl, inLibrary, status }: BrowseMangaCardProps) {
  return (
    <Link href={mangaHref(id)} className="group flex flex-col gap-1.5 select-none">
      <div className="relative aspect-3/4 rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)] shadow-md">
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 160px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          unoptimized
        />
        {inLibrary && (
          <div className="absolute top-1.5 right-1.5 bg-[var(--primary-dim)]/90 rounded-full p-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wide",
            status === "ongoing" ? "text-green-400" :
            status === "completed" ? "text-blue-400" : "text-gray-400"
          )}>
            {status}
          </span>
        </div>
      </div>
      <p className="text-[var(--text)] text-xs font-medium line-clamp-2 leading-tight px-0.5">
        {title}
      </p>
    </Link>
  );
}
