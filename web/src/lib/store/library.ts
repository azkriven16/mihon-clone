import { create } from "zustand";
import { db, addToLibrary, removeFromLibrary, getLibrary, createCategory, deleteCategory } from "@/lib/db";
import type { LibraryManga, Manga, Category } from "@/types";
import { getMangaTitle, getMangaCoverUrl } from "@/types";

interface LibraryStore {
  manga: LibraryManga[];
  categories: Category[];
  activeCategory: string;
  loading: boolean;
  loadLibrary: () => Promise<void>;
  addManga: (manga: Manga, totalChapters?: number) => Promise<void>;
  removeManga: (mangaId: string) => Promise<void>;
  isInLibrary: (mangaId: string) => boolean;
  setActiveCategory: (id: string) => void;
  loadCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  assignMangaToCategory: (mangaId: string, categoryId: string, assign: boolean) => Promise<void>;
}

export const useLibrary = create<LibraryStore>((set, get) => ({
  manga: [],
  categories: [{ id: "all", name: "All", order: -1 }],
  activeCategory: "all",
  loading: false,

  loadLibrary: async () => {
    set({ loading: true });
    const cat = get().activeCategory;
    const manga = await getLibrary(cat === "all" ? undefined : cat);
    set({ manga, loading: false });
  },

  addManga: async (manga: Manga, totalChapters?: number) => {
    const entry: LibraryManga = {
      id: manga.id,
      title: getMangaTitle(manga),
      coverUrl: getMangaCoverUrl(manga, "256"),
      status: manga.attributes.status,
      addedAt: Date.now(),
      categories: [],
      unreadCount: totalChapters ?? 0,
      totalChapters: totalChapters ?? 0,
    };
    await addToLibrary(entry);
    await get().loadLibrary();
  },

  removeManga: async (mangaId: string) => {
    await removeFromLibrary(mangaId);
    await get().loadLibrary();
  },

  isInLibrary: (mangaId: string) => {
    return get().manga.some((m) => m.id === mangaId);
  },

  setActiveCategory: (id: string) => {
    set({ activeCategory: id });
    get().loadLibrary();
  },

  loadCategories: async () => {
    const cats = await db.categories.orderBy("order").toArray();
    set({ categories: [{ id: "all", name: "All", order: -1 }, ...cats] });
  },

  createCategory: async (name: string) => {
    await createCategory(name);
    await get().loadCategories();
  },

  deleteCategory: async (id: string) => {
    await deleteCategory(id);
    await get().loadCategories();
    await get().loadLibrary();
  },

  assignMangaToCategory: async (mangaId: string, categoryId: string, assign: boolean) => {
    const current = get().manga.find((m) => m.id === mangaId);
    if (!current) return;
    const newCategories = assign
      ? [...new Set([...current.categories, categoryId])]
      : current.categories.filter((c) => c !== categoryId);
    await db.library.update(mangaId, { categories: newCategories });
    await get().loadLibrary();
  },
}));
