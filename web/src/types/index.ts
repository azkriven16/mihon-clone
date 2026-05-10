// MangaDex API types
export interface MangaTag {
  id: string;
  type: "tag";
  attributes: {
    name: Record<string, string>;
    group: "genre" | "theme" | "format" | "content";
  };
}

export interface MangaCoverArt {
  id: string;
  type: "cover_art";
  attributes: {
    fileName: string;
    volume?: string;
    locale?: string;
  };
}

export interface MangaAuthor {
  id: string;
  type: "author" | "artist";
  attributes: {
    name: string;
  };
}

export type ContentRating = "safe" | "suggestive" | "erotica" | "pornographic";
export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled";
export type ReadingDirection = "ltr" | "rtl" | "vertical" | "webtoon";

export interface Manga {
  id: string;
  type: "manga";
  attributes: {
    title: Record<string, string>;
    altTitles: Array<Record<string, string>>;
    description: Record<string, string>;
    status: MangaStatus;
    year?: number;
    contentRating: ContentRating;
    tags: MangaTag[];
    availableTranslatedLanguages: string[];
    lastVolume?: string;
    lastChapter?: string;
    originalLanguage: string;
    latestUploadedChapter?: string;
    updatedAt: string;
    createdAt: string;
  };
  relationships: Array<MangaCoverArt | MangaAuthor | { id: string; type: string }>;
}

export interface Chapter {
  id: string;
  type: "chapter";
  attributes: {
    volume?: string;
    chapter?: string;
    title?: string;
    translatedLanguage: string;
    pages: number;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    externalUrl?: string;
  };
  relationships: Array<{
    id: string;
    type: "manga" | "scanlation_group" | "user";
    attributes?: { name?: string; username?: string };
  }>;
}

export interface AtHomeResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaDexListResponse<T> {
  result: "ok" | "error";
  response: "collection";
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

export interface MangaDexSingleResponse<T> {
  result: "ok" | "error";
  response: "entity";
  data: T;
}

// Local DB types
export interface LibraryManga {
  id: string;
  title: string;
  coverUrl: string;
  status: MangaStatus;
  lastReadChapterId?: string;
  lastReadAt?: number;
  addedAt: number;
  categories: string[];
  unreadCount: number;
  totalChapters: number;
}

export interface ReadingHistory {
  chapterId: string;
  mangaId: string;
  mangaTitle: string;
  chapterNum?: string;
  chapterTitle?: string;
  coverUrl: string;
  readAt: number;
  page: number;
  totalPages: number;
}

export interface ReadingProgress {
  chapterId: string;
  page: number;
  totalPages: number;
  completed: boolean;
  readAt: number;
}

export interface DownloadedChapter {
  chapterId: string;
  mangaId: string;
  mangaTitle?: string;
  coverUrl?: string;
  chapterNum?: string;
  pages: string[];
  downloadedAt: number;
  size: number;
}

// UI types
export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface SearchFilters {
  contentRating: ContentRating[];
  status: MangaStatus[];
  tags: string[];
  sortBy: "followedCount" | "relevance" | "latestUploadedChapter" | "rating" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
}

export interface SourceRepository {
  id: string;
  name: string;
  url: string;
  providerCount: number;
  addedAt: number;
  lastSyncedAt?: number;
}

export interface SourceProvider {
  id: string;
  name: string;
  lang: string;
  repositoryId: string;
  repositoryName: string;
  version?: string;
  packageName?: string;
  apkUrl?: string;
  nsfw: boolean;
  installed: boolean;
  searchable: boolean;
}

export type ReaderMode = "single" | "double" | "webtoon";
export type PageFit = "width" | "height" | "contain";

export type LibrarySortKey = "lastRead" | "dateAdded" | "title" | "unread";

export interface ReaderSettings {
  mode: ReaderMode;
  direction: ReadingDirection;
  pageFit: PageFit;
  backgroundColor: string;
  brightness: number;
  dataSaver: boolean;
  showPageNumber: boolean;
}

export interface AppSettings {
  reader: ReaderSettings;
  language: string[];
  contentRating: ContentRating[];
  nsfw: boolean;
  theme: "dark" | "amoled" | "light";
  librarySort: LibrarySortKey;
  sourceRepositories: SourceRepository[];
  sourceProviders: SourceProvider[];
  enabledSourceIds: string[];
  activeSourceId: string;
}

// Helper
export function getMangaTitle(manga: Manga): string {
  const t = manga.attributes.title;
  return t.en || t["ja-ro"] || t.ja || t["zh-ro"] || Object.values(t)[0] || "Unknown";
}

export function getMangaCoverUrl(manga: Manga, size: "256" | "512" | "" = "256"): string {
  const cover = manga.relationships.find((r) => r.type === "cover_art") as MangaCoverArt | undefined;
  if (!cover) return "/placeholder.png";
  const suffix = size ? `.${size}.jpg` : "";
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}${suffix}`;
}

export function getChapterLabel(chapter: Chapter): string {
  const { volume, chapter: num, title } = chapter.attributes;
  if (num) {
    const vol = volume ? `Vol.${volume} ` : "";
    const tit = title ? ` - ${title}` : "";
    return `${vol}Ch.${num}${tit}`;
  }
  return title || "Oneshot";
}
