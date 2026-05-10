import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, LibrarySortKey, ReaderSettings, SourceProvider, SourceRepository } from "@/types";

export const MANGADEX_SOURCE_ID = "builtin:mangadex";

export const MANGADEX_SOURCE: SourceProvider = {
  id: MANGADEX_SOURCE_ID,
  name: "MangaDex",
  lang: "multi",
  repositoryId: "builtin",
  repositoryName: "Built-in",
  version: "api",
  nsfw: false,
  installed: true,
  searchable: true,
};

const defaultReader: ReaderSettings = {
  mode: "single",
  direction: "ltr",
  pageFit: "width",
  backgroundColor: "#000000",
  brightness: 100,
  dataSaver: false,
  showPageNumber: true,
};

const defaultSettings: AppSettings = {
  reader: defaultReader,
  language: ["en"],
  contentRating: ["safe", "suggestive"],
  nsfw: false,
  theme: "dark",
  librarySort: "lastRead",
  sourceRepositories: [],
  sourceProviders: [MANGADEX_SOURCE],
  enabledSourceIds: [MANGADEX_SOURCE_ID],
  activeSourceId: MANGADEX_SOURCE_ID,
};

interface SettingsStore {
  settings: AppSettings;
  setReaderMode: (mode: ReaderSettings["mode"]) => void;
  setReaderDirection: (direction: ReaderSettings["direction"]) => void;
  setPageFit: (fit: ReaderSettings["pageFit"]) => void;
  setBrightness: (b: number) => void;
  setDataSaver: (v: boolean) => void;
  setShowPageNumber: (v: boolean) => void;
  setTheme: (t: AppSettings["theme"]) => void;
  setLibrarySort: (sort: LibrarySortKey) => void;
  setLanguages: (langs: string[]) => void;
  setContentRating: (ratings: AppSettings["contentRating"]) => void;
  addSourceRepository: (repo: SourceRepository, providers: SourceProvider[]) => void;
  removeSourceRepository: (repoId: string) => void;
  toggleSourceProvider: (providerId: string) => void;
  setActiveSource: (providerId: string) => void;
  reset: () => void;
}

function normalizeSettings(settings: AppSettings): AppSettings {
  const sourceProviders = [
    MANGADEX_SOURCE,
    ...(settings.sourceProviders ?? []).filter((source) => source.id !== MANGADEX_SOURCE_ID),
  ];
  const enabledSourceIds = Array.from(new Set([MANGADEX_SOURCE_ID, ...(settings.enabledSourceIds ?? [])]));
  const activeSourceId = sourceProviders.some((source) => source.id === settings.activeSourceId && source.searchable)
    ? settings.activeSourceId
    : MANGADEX_SOURCE_ID;

  return {
    ...settings,
    sourceRepositories: settings.sourceRepositories ?? [],
    sourceProviders,
    enabledSourceIds,
    activeSourceId,
    librarySort: settings.librarySort ?? "lastRead",
    reader: {
      ...settings.reader,
      showPageNumber: settings.reader.showPageNumber ?? true,
    },
  };
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setReaderMode: (mode) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, mode } } })),
      setReaderDirection: (direction) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, direction } } })),
      setPageFit: (pageFit) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, pageFit } } })),
      setBrightness: (brightness) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, brightness } } })),
      setDataSaver: (dataSaver) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, dataSaver } } })),
      setShowPageNumber: (showPageNumber) =>
        set((s) => ({ settings: { ...s.settings, reader: { ...s.settings.reader, showPageNumber } } })),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setLibrarySort: (librarySort) => set((s) => ({ settings: { ...s.settings, librarySort } })),
      setLanguages: (language) => set((s) => ({ settings: { ...s.settings, language } })),
      setContentRating: (contentRating) => set((s) => ({ settings: { ...s.settings, contentRating } })),
      addSourceRepository: (repo, providers) =>
        set((s) => {
          const sourceRepositories = [
            ...s.settings.sourceRepositories.filter((item) => item.id !== repo.id && item.url !== repo.url),
            repo,
          ];
          const sourceProviders = [
            MANGADEX_SOURCE,
            ...s.settings.sourceProviders.filter(
              (source) => source.id !== MANGADEX_SOURCE_ID && source.repositoryId !== repo.id
            ),
            ...providers,
          ];
          return { settings: { ...s.settings, sourceRepositories, sourceProviders } };
        }),
      removeSourceRepository: (repoId) =>
        set((s) => {
          const sourceRepositories = s.settings.sourceRepositories.filter((repo) => repo.id !== repoId);
          const sourceProviders = s.settings.sourceProviders.filter((source) => source.repositoryId !== repoId);
          const enabledSourceIds = s.settings.enabledSourceIds.filter(
            (sourceId) => !s.settings.sourceProviders.some((source) => source.repositoryId === repoId && source.id === sourceId)
          );
          const activeSourceId = sourceProviders.some((source) => source.id === s.settings.activeSourceId)
            ? s.settings.activeSourceId
            : MANGADEX_SOURCE_ID;

          return {
            settings: {
              ...s.settings,
              sourceRepositories,
              sourceProviders,
              enabledSourceIds: Array.from(new Set([MANGADEX_SOURCE_ID, ...enabledSourceIds])),
              activeSourceId,
            },
          };
        }),
      toggleSourceProvider: (providerId) =>
        set((s) => {
          if (providerId === MANGADEX_SOURCE_ID) return s;
          const enabledSourceIds = s.settings.enabledSourceIds.includes(providerId)
            ? s.settings.enabledSourceIds.filter((id) => id !== providerId)
            : [...s.settings.enabledSourceIds, providerId];
          const activeSourceId = enabledSourceIds.includes(s.settings.activeSourceId)
            ? s.settings.activeSourceId
            : MANGADEX_SOURCE_ID;

          return {
            settings: {
              ...s.settings,
              enabledSourceIds: Array.from(new Set([MANGADEX_SOURCE_ID, ...enabledSourceIds])),
              activeSourceId,
            },
          };
        }),
      setActiveSource: (activeSourceId) =>
        set((s) => {
          const source = s.settings.sourceProviders.find((item) => item.id === activeSourceId);
          if (!source?.searchable) return s;
          return {
            settings: {
              ...s.settings,
              enabledSourceIds: Array.from(new Set([...s.settings.enabledSourceIds, activeSourceId])),
              activeSourceId,
            },
          };
        }),
      reset: () => set({ settings: defaultSettings }),
    }),
    {
      name: "mihon-settings",
      merge: (persisted, current) => {
        const persistedSettings = (persisted as { settings?: AppSettings } | undefined)?.settings;
        return {
          ...current,
          ...(persisted as object),
          settings: normalizeSettings({ ...current.settings, ...persistedSettings }),
        };
      },
    }
  )
);
