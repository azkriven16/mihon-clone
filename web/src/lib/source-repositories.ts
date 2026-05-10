import type { SourceProvider, SourceRepository } from "@/types";

const KNOWN_REPOS: Record<string, string> = {
  "https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json": "Keiyoushi",
};

interface ExtensionIndexEntry {
  name?: string;
  pkg?: string;
  apk?: string;
  lang?: string;
  code?: number;
  version?: string;
  nsfw?: number | boolean;
  sources?: Array<{ name?: string; lang?: string; id?: string; baseUrl?: string }>;
}

function toId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function normalizeRepositoryUrl(value: string): string {
  return value.trim();
}

export function getRepositoryName(url: string): string {
  return KNOWN_REPOS[url] ?? new URL(url).hostname.replace(/^www\./, "");
}

export function createRepository(url: string, providerCount = 0): SourceRepository {
  const normalizedUrl = normalizeRepositoryUrl(url);
  return {
    id: `repo:${toId(normalizedUrl)}`,
    name: getRepositoryName(normalizedUrl),
    url: normalizedUrl,
    providerCount,
    addedAt: Date.now(),
    lastSyncedAt: providerCount > 0 ? Date.now() : undefined,
  };
}

export async function fetchRepositoryProviders(url: string): Promise<{ repo: SourceRepository; providers: SourceProvider[] }> {
  const normalizedUrl = normalizeRepositoryUrl(url);
  const response = await fetch(normalizedUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Repository returned ${response.status}`);
  }

  const entries = (await response.json()) as ExtensionIndexEntry[];
  if (!Array.isArray(entries)) {
    throw new Error("Repository index must be a JSON array");
  }

  const repo = createRepository(normalizedUrl, entries.length);
  const providers = entries.map((entry, index): SourceProvider => {
    const firstSource = entry.sources?.[0];
    const name = firstSource?.name ?? entry.name ?? entry.pkg ?? "Unknown source";
    const packageName = entry.pkg;
    const idSeed = packageName ?? `${repo.id}:${name}:${entry.lang ?? index}`;

    return {
      id: `repo-source:${toId(idSeed)}`,
      name,
      lang: firstSource?.lang ?? entry.lang ?? "unknown",
      repositoryId: repo.id,
      repositoryName: repo.name,
      version: entry.version,
      packageName,
      apkUrl: entry.apk ? new URL(entry.apk, normalizedUrl).toString() : undefined,
      nsfw: Boolean(entry.nsfw),
      installed: false,
      searchable: false,
    };
  });

  return { repo, providers };
}
