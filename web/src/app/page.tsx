import Link from "next/link";

const GITHUB_URL = "https://github.com/azkriven16/mihon-clone";
const RELEASE_URL = `${GITHUB_URL}/releases/latest`;
const WINDOWS_URL = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_x64-setup.exe`;
const MACOS_URL   = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_x64.dmg`;
const LINUX_URL   = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_amd64.AppImage`;

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: "Massive Library",
    desc: "Browse and read from MangaDex — tens of thousands of titles across every genre, fully free.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Native Desktop App",
    desc: "Built with Tauri — lightweight, fast, and feels native on Windows, macOS, and Linux.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    title: "Offline Reading",
    desc: "Download chapters to read anywhere, no internet required. Your library lives on your device.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Progress Sync",
    desc: "Picks up exactly where you left off — reading position saved per chapter automatically.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "Flexible Reader",
    desc: "Paged, webtoon scroll, left-to-right or right-to-left. Pinch-to-zoom and swipe gestures built in.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
    title: "Open Source",
    desc: "MIT licensed, community-driven. Fork it, extend it, make it yours.",
  },
];

function AppMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none" aria-hidden="true">
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#212121" }}>
        <div className="flex items-center gap-1.5 px-4 h-9" style={{ background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: "rgba(239,68,68,0.8)" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "rgba(234,179,8,0.8)" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "rgba(34,197,94,0.8)" }} />
          <span className="ml-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>Mihon Clone</span>
        </div>
        <div className="flex h-72">
          <div className="w-14 flex flex-col items-center py-3 gap-4" style={{ borderRight: "1px solid rgba(255,255,255,0.08)", background: "#212121" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f88a00" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="10" height="13" rx="1.5" fill="white" opacity="0.4" />
                <rect x="4" y="1" width="10" height="13" rx="1.5" fill="white" opacity="0.7" />
                <rect x="7" y="4" width="10" height="13" rx="1.5" fill="white" />
              </svg>
            </div>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="w-5 h-5 rounded" style={{ background: i === 1 ? "#f88a00" : "#333" }} />
            ))}
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>Browse</div>
            <div className="grid grid-cols-4 gap-2">
              {["#3d2b1f","#1a2c3d","#2d1a3d","#1a3d2d","#3d1a1a","#2d3d1a","#1a1a3d","#3d2d1a"].map((bg, i) => (
                <div key={i} className="rounded" style={{ aspectRatio: "3/4", background: bg }}>
                  <div className="h-full w-full rounded" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 rounded-full opacity-20" style={{ filter: "blur(60px)", background: "radial-gradient(ellipse, #f88a00 0%, transparent 70%)" }} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0f0f", color: "#e5e5e5", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", background: "rgba(15,15,15,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.35" />
              <rect x="4" y="1" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.6" />
              <rect x="7" y="4" width="10" height="13" rx="1.5" fill="#f88a00" />
            </svg>
            <span className="font-bold text-white text-sm tracking-tight">Mihon Clone</span>
          </div>
          <nav className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <a href="#features" className="hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#download" className="hover:text-white transition-colors hidden md:block">Download</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="hidden md:block">GitHub</span>
            </a>
            <Link href="/library"
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ background: "#f88a00" }}>
              Open App
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ background: "rgba(248,138,0,0.1)", border: "1px solid rgba(248,138,0,0.25)", color: "rgba(255,255,255,0.6)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f88a00" }} />
          v0.1.0 · Open Source · Free Forever
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6" style={{ lineHeight: 1.05 }}>
          Manga reading,<br />
          <span style={{ color: "#f88a00" }}>done right.</span>
        </h1>
        <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          A free, open-source manga reader inspired by Mihon. Read from MangaDex, download for offline use, and enjoy a native desktop experience on any platform.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#download"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110 active:scale-95"
            style={{ background: "#f88a00" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Desktop App
          </a>
          <Link href="/library"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/8 active:scale-95 text-white"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            Open in Browser
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/8 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        <div className="mt-20 w-full max-w-2xl">
          <AppMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ background: "#141414" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>Built for readers who care about quality, performance, and ownership of their data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="p-6 rounded-2xl transition-colors"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(248,138,0,0.12)", color: "#f88a00" }}>
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Download for desktop</h2>
          <p className="mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>Native app for Windows, macOS, and Linux. Under 10 MB, no bloat.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: WINDOWS_URL,
                label: "Windows",
                sub: "x64 · .exe installer",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                ),
              },
              {
                href: MACOS_URL,
                label: "macOS",
                sub: "x64 / Apple Silicon · .dmg",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                ),
              },
              {
                href: LINUX_URL,
                label: "Linux",
                sub: "x64 · AppImage",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.295l.002.008c.361.76 1.051 1.101 2.087-.057 1.355-.4 1.956-1.274 2.285-2.285.125-.329.196-.657.255-.98.05-.244.112-.484.192-.634.34-.683.24-1.813.085-2.64-.063-.33-.192-.618-.337-.874-.193-.3-.466-.61-.7-.918-.455-.635-.88-1.396-1.29-2.08-.11-.178-.22-.363-.337-.542-.32-.495-.659-1.012-1.026-1.46-.17-.215-.285-.392-.42-.578-.183-.254-.362-.506-.632-.716-.292-.21-.503-.377-.52-.542-.076-.576.148-1.28.296-1.878.256-1.062.456-1.867.28-2.685-.179-.82-.823-1.614-1.857-2.019a4.083 4.083 0 00-1.584-.295z"/>
                  </svg>
                ),
              },
            ].map(({ href, label, sub, icon }) => (
              <a key={label} href={href}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
                <div className="transition-colors group-hover:text-white">{icon}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>
                  Download
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              All releases
            </a>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Report a bug</a>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">MIT License</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0f0f0f" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.35" />
              <rect x="4" y="1" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.6" />
              <rect x="7" y="4" width="10" height="13" rx="1.5" fill="#f88a00" />
            </svg>
            <span>Mihon Clone · Not affiliated with Mihon or MangaDex</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">GitHub</a>
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Releases</a>
            <Link href="/library" className="hover:text-white/60 transition-colors">Open App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
