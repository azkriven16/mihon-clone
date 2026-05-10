# Desktop App Plan

## Direction

Use Tauri as the desktop shell around the existing Next app. Keep React/Next responsible for the UI, and move filesystem-heavy work into the Tauri backend.

## Architecture

- Next app: library, browse, reader, settings and source management UI.
- Tauri backend: downloads, local filesystem paths, SQLite, provider HTTP calls, backup/restore and OS integration.
- Provider adapters: a shared interface for `search`, `getManga`, `getChapters` and `getPages`.
- Storage: app data directory for SQLite plus chapter image files.

## Storage Layout

```text
app-data/
  mihon-clone.sqlite3
  downloads/
    {sourceId}/
      {mangaId}/
        {chapterId}/
          001.jpg
          002.jpg
```

## Milestones

1. Desktop shell
   - Add Tauri config, npm scripts and Rust command registration.
   - Build the Next app as a static export for desktop packaging.
   - Expose initial native path capabilities to the frontend.

2. Local database
   - Add SQLite migrations for sources, manga, chapters, library entries, read progress and downloads.
   - Create Rust commands for library CRUD and progress updates.
   - Keep Dexie as the web/PWA fallback until desktop persistence is complete.

3. Download manager
   - Add a queue table with states: queued, running, paused, failed, complete.
   - Download chapter pages through the Tauri backend with per-source concurrency limits.
   - Persist retries and resume partial downloads.

4. Reader integration
   - Resolve page URLs from local files when a chapter is downloaded.
   - Fall back to remote URLs when not downloaded.
   - Add webtoon-specific prefetch and memory limits.

5. Provider runtime
   - Keep MangaDex as the first adapter.
   - Treat Mihon/Tachiyomi repository indexes as metadata.
   - Add native or TypeScript adapters for selected sources rather than trying to run Android APK extensions directly.

6. Desktop polish
   - Native backup/restore file dialogs.
   - App update strategy.
   - Window controls, shortcuts and download notifications.
