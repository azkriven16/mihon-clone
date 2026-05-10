import type {
  Manga,
  Chapter,
  AtHomeResponse,
  MangaDexListResponse,
  MangaDexSingleResponse,
  ContentRating,
  MangaStatus,
  SearchFilters,
} from "@/types";

const BASE = "https://api.mangadex.org";
const DEFAULT_LANGS = ["en"];
const DEFAULT_CONTENT = ["safe", "suggestive"] as ContentRating[];
const MANGA_INCLUDES = ["cover_art", "author", "artist"];
const CHAPTER_INCLUDES = ["scanlation_group", "user"];

async function req<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => url.searchParams.append(`${k}[]`, String(item)));
    } else {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function searchManga(
  query: string,
  filters: Partial<SearchFilters> = {},
  offset = 0,
  limit = 20
): Promise<MangaDexListResponse<Manga>> {
  const sortBy = filters.sortBy ?? "followedCount";
  const order = filters.order ?? "desc";
  return req<MangaDexListResponse<Manga>>("/manga", {
    title: query || undefined,
    limit,
    offset,
    includes: MANGA_INCLUDES,
    [`order[${sortBy}]`]: order,
    ...(filters.contentRating?.length ? { contentRating: filters.contentRating } : { contentRating: DEFAULT_CONTENT }),
    ...(filters.status?.length ? { status: filters.status } : {}),
    ...(filters.tags?.length ? { includedTags: filters.tags } : {}),
    availableTranslatedLanguage: DEFAULT_LANGS,
  });
}

export async function getPopularManga(limit = 20): Promise<MangaDexListResponse<Manga>> {
  return req<MangaDexListResponse<Manga>>("/manga", {
    limit,
    includes: MANGA_INCLUDES,
    contentRating: DEFAULT_CONTENT,
    "order[followedCount]": "desc",
    availableTranslatedLanguage: DEFAULT_LANGS,
  });
}

export async function getRecentlyUpdated(limit = 20): Promise<MangaDexListResponse<Manga>> {
  return req<MangaDexListResponse<Manga>>("/manga", {
    limit,
    includes: MANGA_INCLUDES,
    contentRating: DEFAULT_CONTENT,
    "order[latestUploadedChapter]": "desc",
    availableTranslatedLanguage: DEFAULT_LANGS,
  });
}

export async function getSeasonalManga(limit = 20): Promise<MangaDexListResponse<Manga>> {
  // Featured/seasonal list from MangaDex custom list
  return req<MangaDexListResponse<Manga>>("/manga", {
    limit,
    includes: MANGA_INCLUDES,
    contentRating: DEFAULT_CONTENT,
    "order[rating]": "desc",
    availableTranslatedLanguage: DEFAULT_LANGS,
    status: ["ongoing"] as MangaStatus[],
  });
}

export async function getManga(id: string): Promise<MangaDexSingleResponse<Manga>> {
  return req<MangaDexSingleResponse<Manga>>(`/manga/${id}`, {
    includes: MANGA_INCLUDES,
  });
}

export async function getMangaChapters(
  mangaId: string,
  offset = 0,
  limit = 100,
  lang = "en"
): Promise<MangaDexListResponse<Chapter>> {
  return req<MangaDexListResponse<Chapter>>(`/manga/${mangaId}/feed`, {
    limit,
    offset,
    translatedLanguage: [lang],
    "order[volume]": "desc",
    "order[chapter]": "desc",
    includes: CHAPTER_INCLUDES,
    contentRating: ["safe", "suggestive", "erotica"],
  });
}

export async function getChapter(chapterId: string): Promise<MangaDexSingleResponse<Chapter>> {
  return req<MangaDexSingleResponse<Chapter>>(`/chapter/${chapterId}`, {
    includes: CHAPTER_INCLUDES,
  });
}

export async function getChapterPages(chapterId: string): Promise<AtHomeResponse> {
  return req<AtHomeResponse>(`/at-home/server/${chapterId}`);
}

export async function getMangaTags(): Promise<{ data: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }> }> {
  return req("/manga/tag");
}

export function buildPageUrl(
  baseUrl: string,
  hash: string,
  filename: string,
  dataSaver = false
): string {
  const quality = dataSaver ? "data-saver" : "data";
  return `${baseUrl}/${quality}/${hash}/${filename}`;
}
