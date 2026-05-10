"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReaderView } from "@/components/reader/ReaderView";
import { mangaHref } from "@/lib/routes";

export default function ReaderPage() {
  return (
    <Suspense fallback={null}>
      <ReaderPageContent />
    </Suspense>
  );
}

function ReaderPageContent() {
  const searchParams = useSearchParams();
  const mangaId = searchParams.get("mangaId");
  const chapterId = searchParams.get("chapterId");

  if (!mangaId || !chapterId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text font-semibold">No chapter selected</p>
        <Link href={mangaId ? mangaHref(mangaId) : "/library"} className="text-primary text-sm font-medium">
          Back to library
        </Link>
      </div>
    );
  }

  return <ReaderView mangaId={mangaId} chapterId={chapterId} />;
}
