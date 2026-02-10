"use client";

import { FormEvent, useEffect, useState } from "react";

type Movie = {
  title: string;
  description: string;
  year: number;
};

type SearchField = "title" | "description" | "year";

export default function Home() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<SearchField>("title");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      setLoading(true);
      setError(null);

      try {
        const encodedQuery = encodeURIComponent(query);
        const encodedField = encodeURIComponent(field);
        const response = await fetch(`/api/movies?q=${encodedQuery}&field=${encodedField}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as { movies: Movie[] };
        setMovies(data.movies ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError("Failed to load movies. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      controller.abort();
    };
  }, [query, field]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Movie Search
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 sm:text-base">
            Find movies instantly by title, description, or year.
          </p>
        </header>

        <p className="mt-6 text-center text-sm text-zinc-600 sm:text-base">
          Search by title, description, or year.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-[1fr_190px]"
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: dark, dream, detective..."
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 sm:text-base"
            aria-label="Search movies"
          />
          <select
            value={field}
            onChange={(event) => setField(event.target.value as SearchField)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 sm:text-base"
            aria-label="Search field"
          >
            <option value="title">Title</option>
            <option value="description">Description</option>
            <option value="year">Year</option>
          </select>
        </form>

        <section className="mt-8 sm:mt-10">
          {loading ? (
            <p className="text-center text-sm font-medium text-zinc-500 sm:text-base">
              Loading movies...
            </p>
          ) : null}
          {error ? <p className="text-red-600">{error}</p> : null}

          {!loading && !error && movies.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white/80 px-5 py-8 text-center shadow-sm">
              <p className="text-base font-medium text-zinc-700 sm:text-lg">
                No matching movies found.
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Try a different search term or field.
              </p>
            </div>
          ) : null}

          {!loading && !error && movies.length > 0 ? (
            <ul className="space-y-4">
              {movies.map((movie) => (
                <li
                  key={`${movie.title}-${movie.year}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                >
                  <h2 className="text-lg font-semibold leading-tight text-zinc-900 sm:text-xl">
                    {movie.title} <span className="text-zinc-500">({movie.year})</span>
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-700 sm:text-base">
                    {movie.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </main>
  );
}
