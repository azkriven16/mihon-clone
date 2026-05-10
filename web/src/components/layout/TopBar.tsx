"use client";
import { useState, type ReactNode } from "react";
import { Search, ArrowLeft, X, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  onSearch?: (q: string) => void;
  backHref?: string;
  actions?: ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, onSearch, backHref, actions, transparent }: TopBarProps) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (q: string) => {
    setQuery(q);
    onSearch?.(q);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
    setSearching(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center h-14 px-2 gap-1",
        transparent ? "bg-transparent" : "glass border-b border-[var(--border)]"
      )}
    >
      {backHref ? (
        <a href={backHref} className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text)]">
          <ArrowLeft size={22} />
        </a>
      ) : null}

      {searching ? (
        <div className="flex-1 flex items-center gap-2 bg-[var(--bg-elevated)] rounded-full px-4 h-9">
          <Search size={16} className="text-[var(--text-muted)] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search manga..."
            className="flex-1 bg-transparent text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] outline-none"
          />
          {query && (
            <button onClick={clearSearch} className="text-[var(--text-muted)] hover:text-[var(--text)]">
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <h1 className="flex-1 text-[var(--text)] font-bold text-xl px-2 truncate">{title}</h1>
      )}

      <div className="flex items-center gap-1">
        {onSearch && !searching && (
          <button
            onClick={() => setSearching(true)}
            className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
          >
            <Search size={20} />
          </button>
        )}
        {searching && (
          <button
            onClick={clearSearch}
            className="p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
          >
            <X size={20} />
          </button>
        )}
        {actions}
      </div>
    </header>
  );
}
