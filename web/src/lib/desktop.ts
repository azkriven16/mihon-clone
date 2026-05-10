export interface DesktopCapabilities {
  appDataDir: string;
  downloadRoot: string;
  databasePath: string;
}

export function isDesktopRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getDesktopCapabilities(): Promise<DesktopCapabilities | null> {
  if (!isDesktopRuntime()) return null;

  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DesktopCapabilities>("desktop_capabilities");
}
