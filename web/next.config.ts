import type { NextConfig } from "next";

const isDesktopExport = process.env.TAURI_STATIC_EXPORT === "1";
const isProd = process.env.NODE_ENV === "production";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";

const nextConfig: NextConfig = {
  turbopack: {},
  ...(isDesktopExport ? { output: "export" as const } : {}),
  images: {
    ...(isDesktopExport ? { unoptimized: true } : {}),
    remotePatterns: [
      { protocol: "https", hostname: "uploads.mangadex.org" },
      { protocol: "https", hostname: "*.mangadex.network" },
      { protocol: "https", hostname: "cmdxd98sb0x3yprd.mangadex.network" },
    ],
  },
  assetPrefix: !isDesktopExport && !isProd ? `http://${internalHost}:3000` : undefined,
};

export default nextConfig;
