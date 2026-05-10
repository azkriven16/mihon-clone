export function mangaHref(mangaId: string): string {
  return `/manga?id=${encodeURIComponent(mangaId)}`;
}

export function readerHref(mangaId: string, chapterId: string): string {
  return `/reader?mangaId=${encodeURIComponent(mangaId)}&chapterId=${encodeURIComponent(chapterId)}`;
}
