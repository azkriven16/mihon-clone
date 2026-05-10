"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MangaDetailView } from "@/components/manga/MangaDetailView";

export default function MangaPage() {
  return (
    <Suspense fallback={null}>
      <MangaPageContent />
    </Suspense>
  );
}

function MangaPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text font-semibold">No manga selected</p>
        <Link href="/browse" className="text-primary text-sm font-medium">
          Browse manga
        </Link>
      </div>
    );
  }

  return <MangaDetailView id={id} />;
}
