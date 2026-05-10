"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { useSettings } from "@/lib/store/settings";
import { exportBackup, importBackup, clearHistory, type BackupData } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { LibrarySortKey } from "@/types";
import {
  BookOpen, AlignJustify, Monitor,
  Star, Info, ChevronRight, BarChart2,
  Sun, Moon, Zap, Download, Upload, CheckCircle2,
  Database, Hash, SortAsc, Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const {
    settings,
    setReaderMode, setReaderDirection, setPageFit,
    setBrightness, setDataSaver, setShowPageNumber,
    setTheme, setLibrarySort,
  } = useSettings();
  const { reader } = settings;
  const [backupStatus, setBackupStatus] = useState<"idle" | "ok" | "error">("idle");
  const [clearHistoryStatus, setClearHistoryStatus] = useState<"idle" | "confirm" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mihon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus("ok");
      setTimeout(() => setBackupStatus("idle"), 2500);
    } catch {
      setBackupStatus("error");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      await importBackup(data);
      setBackupStatus("ok");
      setTimeout(() => setBackupStatus("idle"), 2500);
    } catch {
      setBackupStatus("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearHistory = async () => {
    if (clearHistoryStatus === "idle") {
      setClearHistoryStatus("confirm");
      return;
    }
    if (clearHistoryStatus === "confirm") {
      await clearHistory();
      setClearHistoryStatus("done");
      setTimeout(() => setClearHistoryStatus("idle"), 2500);
    }
  };

  const handleLibrarySortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LibrarySortKey;
    setLibrarySort(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("library_sort", value);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Settings" />

      <div className="flex flex-col gap-1 pb-8">
        {/* Reader settings */}
        <SectionHeader>Reader</SectionHeader>

        <SettingRow
          icon={<BookOpen size={18} />}
          label="Reading Mode"
          description={reader.mode === "single" ? "Single Page" : reader.mode === "double" ? "Double Page" : "Webtoon Scroll"}
        >
          <div className="flex gap-2 flex-wrap">
            <Chip active={reader.mode === "single"} onClick={() => setReaderMode("single")}>Single</Chip>
            <Chip active={reader.mode === "double"} onClick={() => setReaderMode("double")}>Double</Chip>
            <Chip active={reader.mode === "webtoon"} onClick={() => setReaderMode("webtoon")}>Webtoon</Chip>
          </div>
        </SettingRow>

        <SettingRow
          icon={<AlignJustify size={18} />}
          label="Reading Direction"
          description="Direction to advance pages"
        >
          <div className="flex gap-2">
            <Chip active={reader.direction === "ltr"} onClick={() => setReaderDirection("ltr")}>
              LTR
            </Chip>
            <Chip active={reader.direction === "rtl"} onClick={() => setReaderDirection("rtl")}>
              RTL
            </Chip>
          </div>
        </SettingRow>

        <SettingRow
          icon={<Monitor size={18} />}
          label="Page Fit"
          description="How pages scale to the screen"
        >
          <div className="flex gap-2">
            {(["width", "height", "contain"] as const).map((f) => (
              <Chip key={f} active={reader.pageFit === f} onClick={() => setPageFit(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Chip>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          icon={<Sun size={18} />}
          label="Brightness"
          description={`${reader.brightness}%`}
        >
          <input
            type="range"
            min={20}
            max={100}
            value={reader.brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-32 accent-primary"
          />
        </SettingRow>

        <ToggleRow
          icon={<Zap size={18} />}
          label="Data Saver"
          description="Load lower quality images to save data"
          value={reader.dataSaver}
          onChange={setDataSaver}
        />

        <ToggleRow
          icon={<Hash size={18} />}
          label="Show Page Number"
          description="Display current page number while reading"
          value={reader.showPageNumber}
          onChange={setShowPageNumber}
        />

        {/* Appearance */}
        <SectionHeader>Appearance</SectionHeader>

        <SettingRow
          icon={<Moon size={18} />}
          label="Theme"
          description={settings.theme}
        >
          <div className="flex gap-2">
            {(["dark", "amoled", "light"] as const).map((t) => (
              <Chip key={t} active={settings.theme === t} onClick={() => setTheme(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Chip>
            ))}
          </div>
        </SettingRow>

        {/* Library */}
        <SectionHeader>Library</SectionHeader>

        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
          <div className="text-text-secondary shrink-0"><SortAsc size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-medium">Default Sort</p>
            <p className="text-text-secondary text-xs mt-0.5">Order manga in your library</p>
          </div>
          <select
            value={settings.librarySort}
            onChange={handleLibrarySortChange}
            className="bg-elevated text-text text-xs rounded-lg px-2 py-1.5 border border-(--border-subtle) focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="lastRead">Last Read</option>
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="unread">Unread Count</option>
          </select>
        </div>

        {/* Browse */}
        <SectionHeader>Browse</SectionHeader>

        <LinkRow
          icon={<Database size={18} />}
          label="Sources"
          description={`${settings.sourceRepositories.length} repositories, ${settings.sourceProviders.length} providers`}
          href="/sources"
          internal
        />

        {/* Data */}
        <SectionHeader>Data</SectionHeader>

        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
          <div className="text-text-secondary shrink-0"><Download size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-medium">Backup</p>
            <p className="text-text-secondary text-xs mt-0.5">Export library, history &amp; progress</p>
          </div>
          <button
            onClick={handleExport}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              backupStatus === "ok"
                ? "bg-accent/20 text-accent"
                : "bg-primary-dim/20 text-primary hover:bg-primary-dim/30"
            )}
          >
            {backupStatus === "ok" ? <><CheckCircle2 size={13} /> Saved</> : "Export"}
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
          <div className="text-text-secondary shrink-0"><Upload size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-medium">Restore</p>
            <p className="text-text-secondary text-xs mt-0.5">Import a backup file (merges with existing data)</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-elevated text-text-secondary hover:text-text transition-colors"
          >
            Import
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
          <div className="text-text-secondary shrink-0"><Trash2 size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-medium">Clear History</p>
            <p className="text-text-secondary text-xs mt-0.5">Remove all reading history entries</p>
          </div>
          <button
            onClick={handleClearHistory}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              clearHistoryStatus === "confirm"
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : clearHistoryStatus === "done"
                ? "bg-accent/20 text-accent"
                : "bg-elevated text-text-secondary hover:text-text"
            )}
          >
            {clearHistoryStatus === "confirm" ? (
              <><Trash2 size={13} /> Confirm?</>
            ) : clearHistoryStatus === "done" ? (
              <><CheckCircle2 size={13} /> Cleared</>
            ) : (
              "Clear"
            )}
          </button>
        </div>

        {/* Activity */}
        <SectionHeader>Activity</SectionHeader>

        <LinkRow
          icon={<BarChart2 size={18} />}
          label="Reading Stats"
          description="Chapters read, streaks and more"
          href="/stats"
          internal
        />

        {/* About */}
        <SectionHeader>About</SectionHeader>

        <LinkRow
          icon={<Info size={18} />}
          label="Mihon Web"
          description="Open source manga reader — v0.1.0"
        />
        <LinkRow
          icon={<Star size={18} />}
          label="Source on GitHub"
          description="github.com/mihonapp/mihon"
          href="https://github.com/mihonapp/mihon"
        />
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5 pb-1">
      <p className="text-primary text-xs font-semibold uppercase tracking-wider">{children}</p>
    </div>
  );
}

function SettingRow({
  icon, label, description, children,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
      <div className="text-text-secondary mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-text text-sm font-medium">{label}</p>
        {description && <p className="text-text-secondary text-xs mt-0.5">{description}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

function ToggleRow({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
      <div className="text-text-secondary shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-text text-sm font-medium">{label}</p>
        {description && <p className="text-text-secondary text-xs mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200",
          value ? "bg-primary-dim" : "bg-elevated"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
            value && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

function LinkRow({
  icon, label, description, href, internal,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  internal?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-(--border-subtle)">
      <div className="text-text-secondary shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-text text-sm font-medium">{label}</p>
        {description && <p className="text-text-secondary text-xs mt-0.5">{description}</p>}
      </div>
      {href && <ChevronRight size={16} className="text-text-muted" />}
    </div>
  );

  if (href && internal) {
    return <Link href={href}>{inner}</Link>;
  }
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return inner;
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("chip", active && "active")}>
      {children}
    </button>
  );
}
