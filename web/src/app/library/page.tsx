"use client";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLibrary } from "@/lib/store/library";
import {
  ArrowUpDown,
  BookOpen,
  Check,
  Grid3X3,
  List,
  Plus,
  Settings,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import type { Category, LibraryManga } from "@/types";
import { mangaHref, readerHref } from "@/lib/routes";

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

type SortKey = "lastRead" | "dateAdded" | "title" | "unread";

const sortLabel: Record<SortKey, string> = {
  lastRead: "Last Read",
  dateAdded: "Date Added",
  title: "Title",
  unread: "Unread",
};

// ---------------------------------------------------------------------------
// Category management sheet
// ---------------------------------------------------------------------------

interface CategorySheetProps {
  categories: Category[];
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function CategorySheet({ categories, onClose, onCreate, onDelete }: CategorySheetProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const userCategories = categories.filter((c) => c.id !== "all");

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await onCreate(trimmed);
    setNewName("");
    setAdding(false);
  };

  const handleAddClick = () => {
    setAdding(true);
    // Focus happens via useEffect after render
  };

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-[var(--bg-surface)] pb-safe max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)]">
          <span className="text-[var(--text)] font-semibold text-base">Manage Categories</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category list */}
        <ul className="py-2">
          {userCategories.length === 0 && !adding && (
            <li className="px-4 py-6 text-center text-[var(--text-muted)] text-sm">
              No categories yet. Tap + to create one.
            </li>
          )}
          {userCategories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors group"
            >
              <Tag size={16} className="text-[var(--text-muted)] shrink-0" />
              <span className="flex-1 text-[var(--text)] text-sm">{cat.name}</span>
              <button
                onClick={() => onDelete(cat.id)}
                className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Delete category ${cat.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}

          {/* Inline new category input */}
          {adding && (
            <li className="flex items-center gap-2 px-4 py-2">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setAdding(false); setNewName(""); }
                }}
                placeholder="Category name..."
                className="flex-1 bg-[var(--bg-elevated)] text-[var(--text)] text-sm rounded-lg px-3 py-2 outline-none placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] focus:border-[var(--primary)]"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-3 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-opacity"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setNewName(""); }}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={16} />
              </button>
            </li>
          )}
        </ul>

        {/* Add button */}
        {!adding && (
          <div className="px-4 pb-4">
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-sm"
            >
              <Plus size={16} />
              New category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assign category sheet
// ---------------------------------------------------------------------------

interface AssignCategorySheetProps {
  manga: LibraryManga;
  categories: Category[];
  onClose: () => void;
  onToggle: (categoryId: string, assign: boolean) => Promise<void>;
}

function AssignCategorySheet({ manga, categories, onClose, onToggle }: AssignCategorySheetProps) {
  const userCategories = categories.filter((c) => c.id !== "all");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-[var(--bg-surface)] pb-safe max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[var(--text)] font-semibold text-base block">Set Categories</span>
            <span className="text-[var(--text-muted)] text-xs truncate block">{manga.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category checkboxes */}
        {userCategories.length === 0 ? (
          <p className="px-4 py-6 text-center text-[var(--text-muted)] text-sm">
            No categories yet. Create one via the gear icon.
          </p>
        ) : (
          <ul className="py-2">
            {userCategories.map((cat) => {
              const checked = manga.categories.includes(cat.id);
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => onToggle(cat.id, !checked)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Tag size={16} className="text-[var(--text-muted)] shrink-0" />
                    <span className="flex-1 text-[var(--text)] text-sm text-left">{cat.name}</span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-[var(--primary)] text-white"
                          : "border border-[var(--border)] text-transparent"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid manga card with "..." overlay
// ---------------------------------------------------------------------------

interface LibraryMangaCardProps {
  manga: LibraryManga;
  onManageCategories: (manga: LibraryManga) => void;
}

function LibraryMangaCard({ manga, onManageCategories }: LibraryMangaCardProps) {
  return (
    <div className="group flex flex-col gap-1.5 select-none relative">
      <Link href={mangaHref(manga.id)} className="block">
        <div className="relative aspect-[2/3] rounded-[var(--radius)] overflow-hidden bg-[var(--bg-card)] shadow-md">
          <Image
            src={manga.coverUrl}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
          {manga.unreadCount > 0 && (
            <div className="absolute top-1.5 left-1.5 badge text-[10px] min-w-[20px] h-5">
              {manga.unreadCount > 99 ? "99+" : manga.unreadCount}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </Link>

      {/* Category button overlay */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onManageCategories(manga);
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white hover:bg-black/80"
        aria-label={`Manage categories for ${manga.title}`}
      >
        <Tag size={11} />
      </button>

      {/* Resume reading button overlay */}
      {manga.lastReadChapterId && (
        <Link
          href={readerHref(manga.id, manga.lastReadChapterId)}
          className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white hover:bg-black/80"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Resume reading ${manga.title}`}
        >
          <BookOpen size={11} />
        </Link>
      )}

      <p className="text-[var(--text)] text-xs font-medium line-clamp-2 leading-tight px-0.5">
        {manga.title}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List item with category button
// ---------------------------------------------------------------------------

interface ListMangaItemProps {
  manga: LibraryManga;
  onManageCategories: (manga: LibraryManga) => void;
}

function ListMangaItem({ manga, onManageCategories }: ListMangaItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors">
      <Link
        href={mangaHref(manga.id)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-card)]">
          <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[var(--text)] font-medium text-sm line-clamp-1">{manga.title}</p>
          <p className="text-[var(--text-secondary)] text-xs mt-0.5 capitalize">{manga.status}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        {manga.unreadCount > 0 && (
          <span className="badge">{manga.unreadCount > 99 ? "99+" : manga.unreadCount}</span>
        )}
        {manga.lastReadChapterId && (
          <Link
            href={readerHref(manga.id, manga.lastReadChapterId)}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            aria-label={`Resume reading ${manga.title}`}
          >
            <BookOpen size={16} />
          </Link>
        )}
        <button
          onClick={() => onManageCategories(manga)}
          className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
          aria-label={`Manage categories for ${manga.title}`}
        >
          <Tag size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LibraryPage() {
  const {
    manga,
    categories,
    activeCategory,
    loading,
    loadLibrary,
    setActiveCategory,
    loadCategories,
    createCategory,
    deleteCategory,
    assignMangaToCategory,
  } = useLibrary();

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<LibraryManga | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("library_sort") as SortKey) ?? "lastRead";
    }
    return "lastRead";
  });
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    loadLibrary();
    loadCategories();
  }, [loadLibrary, loadCategories]);

  const handleSetSort = (key: SortKey) => {
    setSortBy(key);
    localStorage.setItem("library_sort", key);
  };

  const filtered: LibraryManga[] = manga.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const sorted: LibraryManga[] = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "dateAdded":
        return (b.addedAt ?? 0) - (a.addedAt ?? 0);
      case "unread":
        return (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
      case "lastRead":
      default:
        return (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0);
    }
  });

  const handleManageCategories = (m: LibraryManga) => {
    setAssignTarget(m);
  };

  const handleToggleCategory = async (categoryId: string, assign: boolean) => {
    if (!assignTarget) return;
    await assignMangaToCategory(assignTarget.id, categoryId, assign);
    // Update local reference so checkboxes reflect change immediately
    const updated = manga.find((m) => m.id === assignTarget.id);
    if (updated) setAssignTarget({ ...updated });
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Library"
        onSearch={setQuery}
        actions={
          <>
            <button
              onClick={() => setShowSort(!showSort)}
              className={`p-2 rounded-full hover:bg-elevated transition-colors ${showSort ? "text-primary" : "text-text-secondary"}`}
              aria-label="Sort library"
              aria-pressed={showSort}
            >
              <ArrowUpDown size={20} />
            </button>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
              aria-label="Toggle view"
            >
              {view === "grid" ? <List size={20} /> : <Grid3X3 size={20} />}
            </button>
            <button
              onClick={() => setCategorySheetOpen(true)}
              className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
              aria-label="Manage categories"
            >
              <Settings size={20} />
            </button>
          </>
        }
      />

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`chip ${activeCategory === cat.id ? "active" : ""}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort chips */}
      {showSort && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-(--border-subtle)">
          {(["lastRead", "dateAdded", "title", "unread"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSetSort(key)}
              className={`chip ${sortBy === key ? "active" : ""}`}
            >
              {sortLabel[key]}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={56} />}
          title={query ? "No results found" : "Your library is empty"}
          description={
            query
              ? "Try a different search term"
              : "Browse manga and add them to your library"
          }
          action={
            !query && (
              <Link href="/browse">
                <Button variant="primary" size="md">
                  <Plus size={16} />
                  Browse Manga
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              : "flex flex-col"
          }
        >
          {sorted.map((m) =>
            view === "grid" ? (
              <LibraryMangaCard
                key={m.id}
                manga={m}
                onManageCategories={handleManageCategories}
              />
            ) : (
              <ListMangaItem
                key={m.id}
                manga={m}
                onManageCategories={handleManageCategories}
              />
            )
          )}
        </div>
      )}

      {/* Category management sheet */}
      {categorySheetOpen && (
        <CategorySheet
          categories={categories}
          onClose={() => setCategorySheetOpen(false)}
          onCreate={createCategory}
          onDelete={deleteCategory}
        />
      )}

      {/* Assign category sheet */}
      {assignTarget && (
        <AssignCategorySheet
          manga={assignTarget}
          categories={categories}
          onClose={() => setAssignTarget(null)}
          onToggle={handleToggleCategory}
        />
      )}
    </div>
  );
}
