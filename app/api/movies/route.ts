import { NextResponse } from "next/server";

import { db, searchMovies, type SearchField } from "@/lib/movies";

const defaultMoviesStmt = db.prepare(`
  SELECT title, description, year
  FROM movies
  ORDER BY year DESC, title ASC
  LIMIT 10
`);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const fieldParam = searchParams.get("field");
  const trimmed = q.trim();
  const field: SearchField =
    fieldParam === "title" || fieldParam === "description" || fieldParam === "year"
      ? fieldParam
      : "title";

  const movies = trimmed
    ? searchMovies(trimmed, field)
    : (defaultMoviesStmt.all() as ReturnType<typeof searchMovies>);

  return NextResponse.json({ movies });
}
