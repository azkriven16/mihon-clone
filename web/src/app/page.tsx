import Link from "next/link";

const GITHUB_URL = "https://github.com/azkriven16/mihon-clone";
const RELEASE_URL = `${GITHUB_URL}/releases/latest`;
const WINDOWS_URL = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_x64-setup.exe`;
const MACOS_URL   = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_x64.dmg`;
const LINUX_URL   = `${GITHUB_URL}/releases/latest/download/Mihon-Clone_0.1.0_amd64.AppImage`;

const FEATURES = [
  { title: "Massive Library",     desc: "Browse tens of thousands of titles from MangaDex — every genre, fully free.", icon: "📚" },
  { title: "Native Desktop App",  desc: "Built with Tauri. Lightweight, fast, and feels native on Windows, macOS, and Linux.", icon: "🖥️" },
  { title: "Offline Reading",     desc: "Download chapters to read anywhere. Your library lives on your device.", icon: "⬇️" },
  { title: "Progress Sync",       desc: "Picks up exactly where you left off — reading position saved per chapter.", icon: "🔖" },
  { title: "Flexible Reader",     desc: "Paged, webtoon scroll, LTR or RTL. Pinch-to-zoom and swipe gestures built in.", icon: "👁️" },
  { title: "Open Source",         desc: "MIT licensed, community-driven. Fork it, extend it, make it yours.", icon: "⭐" },
];

function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.35" />
      <rect x="4" y="1" width="10" height="13" rx="1.5" fill="#f88a00" opacity="0.6" />
      <rect x="7" y="4" width="10" height="13" rx="1.5" fill="#f88a00" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function AppMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="h-9 bg-[#1a1a1a] border-b border-white/8 flex items-center px-4 gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-white/25 font-medium">Mihon Clone</span>
        </div>
        <div className="flex h-72 bg-[#212121]">
          <div className="w-14 flex flex-col items-center py-3 gap-4 border-r border-white/8 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#f88a00] flex items-center justify-center">
              <Logo size={14} />
            </div>
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-5 h-5 rounded ${i === 1 ? "bg-[#f88a00]" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <p className="text-xs font-semibold text-white/60 mb-3">Browse</p>
            <div className="grid grid-cols-4 gap-2">
              {["#3d2b1f","#1a2c3d","#2d1a3d","#1a3d2d","#3d1a1a","#2d3d1a","#1a1a3d","#3d2d1a"].map((bg, i) => (
                <div key={i} className="rounded aspect-[3/4]" style={{ background: bg }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 rounded-full opacity-20 blur-[60px] bg-[#f88a00]" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#e5e5e5]" style={{ fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-md bg-[#0f0f0f]/88">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-white text-sm tracking-tight">Mihon Clone</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-white/55">
            <a href="#features" className="hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#download" className="hover:text-white transition-colors hidden md:block">Download</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <GithubIcon />
              <span className="hidden md:block">GitHub</span>
            </a>
            <Link href="/library" className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-[#f88a00] hover:brightness-110 transition-all">
              Open App
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f88a00]/30 bg-[#f88a00]/8 text-xs text-white/55 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f88a00] inline-block" />
          v0.1.0 · Open Source · Free Forever
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
          Manga reading,<br />
          <span className="text-[#f88a00]">done right.</span>
        </h1>

        <p className="text-lg text-white/50 max-w-xl leading-relaxed mb-10">
          A free, open-source manga reader inspired by Mihon. Read from MangaDex, download for offline use, and enjoy a native desktop experience on any platform.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#download" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm bg-[#f88a00] hover:brightness-110 transition-all active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Desktop App
          </a>
          <Link href="/library" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white/85 border border-white/15 hover:bg-white/8 transition-all active:scale-95">
            Open in Browser
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white/75 border border-white/15 hover:bg-white/8 transition-all active:scale-95">
            <GithubIcon />
            View on GitHub
          </a>
        </div>

        <div className="mt-20 w-full max-w-2xl">
          <AppMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#141414]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-white/50 max-w-md mx-auto">Built for readers who care about quality, performance, and ownership of their data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/8 hover:border-white/18 transition-colors">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Download for desktop</h2>
          <p className="text-white/50 mb-12">Native app for Windows, macOS, and Linux. Under 10 MB, no bloat.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: WINDOWS_URL, label: "Windows", sub: "x64 · .exe installer",        emoji: "🪟" },
              { href: MACOS_URL,   label: "macOS",   sub: "x64 / Apple Silicon · .dmg",   emoji: "🍎" },
              { href: LINUX_URL,   label: "Linux",   sub: "x64 · AppImage",                emoji: "🐧" },
            ].map(({ href, label, sub, emoji }) => (
              <a key={label} href={href}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/8 hover:border-white/20 hover:bg-white/4 transition-all group">
                <span className="text-4xl">{emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-white/35 text-xs mt-0.5">{sub}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/50 group-hover:border-[#f88a00]/50 group-hover:text-[#f88a00] transition-colors">
                  Download
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/35">
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white/65 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              All releases
            </a>
            <span className="text-white/12">·</span>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:text-white/65 transition-colors">Report a bug</a>
            <span className="text-white/12">·</span>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="hover:text-white/65 transition-colors">MIT License</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/8 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <Logo size={16} />
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
