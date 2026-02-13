import { NextResponse } from "next/server";

import { getDefaultMovies, searchMovies, type SearchField } from "@/lib/movies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const fieldParam = searchParams.get("field");
  const trimmed = q.trim();
  const field: SearchField =
    fieldParam === "all" ||
    fieldParam === "title" ||
    fieldParam === "description" ||
    fieldParam === "year"
      ? fieldParam
      : "all";

  const movies = trimmed ? await searchMovies(trimmed, field) : await getDefaultMovies(10);

  return NextResponse.json({ movies });
}
