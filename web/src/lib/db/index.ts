import Dexie, { type EntityTable } from "dexie";
import type { LibraryManga, ReadingHistory, ReadingProgress, DownloadedChapter, Category } from "@/types";

interface PageBlob {
  key: string; // `${chapterId}/${pageIndex}`
  data: Blob;
}

class MihonDB extends Dexie {
  library!: EntityTable<LibraryManga, "id">;
  history!: EntityTable<ReadingHistory, "chapterId">;
  progress!: EntityTable<ReadingProgress, "chapterId">;
  downloads!: EntityTable<DownloadedChapter, "chapterId">;
  categories!: EntityTable<Category, "id">;
  pageBlobs!: EntityTable<PageBlob, "key">;

  constructor() {
    super("MihonDB");
    this.version(1).stores({
      library: "id, title, status, lastReadAt, addedAt, *categories",
      history: "chapterId, mangaId, readAt",
      progress: "chapterId, readAt",
      downloads: "chapterId, mangaId, downloadedAt",
      categories: "id, name, order",
    });
    this.version(2).stores({
      pageBlobs: "key",
    });
  }
}

export const db = new MihonDB();

// Library operations
export async function addToLibrary(manga: LibraryManga): Promise<void> {
  await db.library.put(manga);
}

export async function removeFromLibrary(mangaId: string): Promise<void> {
  await db.library.delete(mangaId);
}

export async function isInLibrary(mangaId: string): Promise<boolean> {
  const m = await db.library.get(mangaId);
  return !!m;
}

export async function getLibrary(categoryId?: string): Promise<LibraryManga[]> {
  if (categoryId) {
    return db.library.where("categories").equals(categoryId).toArray();
  }
  return db.library.orderBy("lastReadAt").reverse().toArray();
}

export async function updateLastRead(
  mangaId: string,
  chapterId: string
): Promise<void> {
  await db.library.update(mangaId, {
    lastReadChapterId: chapterId,
    lastReadAt: Date.now(),
  });
}

export async function updateUnreadCount(
  mangaId: string,
  unreadCount: number
): Promise<void> {
  await db.library.update(mangaId, { unreadCount });
}

// History operations
export async function addToHistory(entry: ReadingHistory): Promise<void> {
  await db.history.put(entry);
}

export async function getHistory(limit = 50): Promise<ReadingHistory[]> {
  return db.history.orderBy("readAt").reverse().limit(limit).toArray();
}

export async function clearHistory(): Promise<void> {
  await db.history.clear();
}

// Progress operations
export async function saveProgress(progress: ReadingProgress): Promise<void> {
  await db.progress.put(progress);
}

export async function getProgress(chapterId: string): Promise<ReadingProgress | undefined> {
  return db.progress.get(chapterId);
}

export async function markChapterRead(chapterId: string, totalPages: number): Promise<void> {
  await db.progress.put({
    chapterId,
    page: totalPages,
    totalPages,
    completed: true,
    readAt: Date.now(),
  });
}

export async function getReadChapterIds(mangaId: string, chapterIds: string[]): Promise<Set<string>> {
  const read = await db.progress
    .where("chapterId")
    .anyOf(chapterIds)
    .and((p) => p.completed)
    .toArray();
  return new Set(read.map((p) => p.chapterId));
}

export async function refreshUnreadCount(mangaId: string, allChapterIds: string[]): Promise<void> {
  const inLib = await db.library.get(mangaId);
  if (!inLib) return;
  const readIds = await getReadChapterIds(mangaId, allChapterIds);
  const unreadCount = Math.max(0, allChapterIds.length - readIds.size);
  await updateUnreadCount(mangaId, unreadCount);
}

// Category operations
export async function getCategories(): Promise<Category[]> {
  const cats = await db.categories.orderBy("order").toArray();
  return [{ id: "all", name: "All", order: -1 }, ...cats];
}

export async function createCategory(name: string): Promise<string> {
  const id = crypto.randomUUID();
  const order = (await db.categories.count()) + 1;
  await db.categories.put({ id, name, order });
  return id;
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
  const all = await db.library.toArray();
  for (const manga of all) {
    if (manga.categories.includes(id)) {
      await db.library.update(manga.id, {
        categories: manga.categories.filter((c) => c !== id),
      });
    }
  }
}

// Download operations
export async function downloadChapter(
  chapterId: string,
  mangaId: string,
  pageUrls: string[],
  meta: { chapterNum?: string; mangaTitle?: string; coverUrl?: string },
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  let totalSize = 0;
  const BATCH = 4;

  for (let i = 0; i < pageUrls.length; i += BATCH) {
    const slice = pageUrls.slice(i, Math.min(i + BATCH, pageUrls.length));
    await Promise.all(
      slice.map(async (url, j) => {
        const res = await fetch(url);
        const blob = await res.blob();
        totalSize += blob.size;
        await db.pageBlobs.put({ key: `${chapterId}/${i + j}`, data: blob });
        onProgress(++loaded, pageUrls.length);
      })
    );
  }

  await db.downloads.put({
    chapterId,
    mangaId,
    mangaTitle: meta.mangaTitle,
    coverUrl: meta.coverUrl,
    chapterNum: meta.chapterNum,
    pages: pageUrls,
    downloadedAt: Date.now(),
    size: totalSize,
  });
}

export async function getDownloadedPages(chapterId: string): Promise<string[] | null> {
  const dl = await db.downloads.get(chapterId);
  if (!dl) return null;
  const objectUrls: string[] = [];
  for (let i = 0; i < dl.pages.length; i++) {
    const blob = await db.pageBlobs.get(`${chapterId}/${i}`);
    if (!blob) return null;
    objectUrls.push(URL.createObjectURL(blob.data));
  }
  return objectUrls;
}

export async function deleteDownload(chapterId: string): Promise<void> {
  const dl = await db.downloads.get(chapterId);
  if (!dl) return;
  for (let i = 0; i < dl.pages.length; i++) {
    await db.pageBlobs.delete(`${chapterId}/${i}`);
  }
  await db.downloads.delete(chapterId);
}

export async function getDownloadedChapterIds(mangaId: string): Promise<Set<string>> {
  const dls = await db.downloads.where("mangaId").equals(mangaId).toArray();
  return new Set(dls.map((d) => d.chapterId));
}

export async function getAllDownloads(): Promise<DownloadedChapter[]> {
  return db.downloads.orderBy("downloadedAt").reverse().toArray();
}

export async function getTotalDownloadSize(): Promise<number> {
  const all = await db.downloads.toArray();
  return all.reduce((sum, d) => sum + d.size, 0);
}

// Backup / restore
export interface BackupData {
  version: number;
  exportedAt: string;
  library: LibraryManga[];
  history: ReadingHistory[];
  progress: ReadingProgress[];
  categories: Category[];
}

export async function exportBackup(): Promise<BackupData> {
  const [library, history, progress, categories] = await Promise.all([
    db.library.toArray(),
    db.history.toArray(),
    db.progress.toArray(),
    db.categories.toArray(),
  ]);
  return { version: 1, exportedAt: new Date().toISOString(), library, history, progress, categories };
}

export async function importBackup(data: BackupData): Promise<void> {
  await Promise.all([
    db.library.bulkPut(data.library),
    db.history.bulkPut(data.history),
    db.progress.bulkPut(data.progress),
    db.categories.bulkPut(data.categories),
  ]);
}
