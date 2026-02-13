import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export type Movie = {
  id: number;
  title: string;
  description: string;
  year: number;
};

export type SearchField = "all" | "title" | "description" | "year";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

declare global {
  var __moviesPool: Pool | undefined;
}

let initPromise: Promise<void> | null = null;

async function ensureMoviesTable() {
  if (!initPromise) {
    initPromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          year INTEGER NOT NULL
        )
      `)
      .then(() => undefined);
  }

  await initPromise;
}

export async function getDefaultMovies(limit = 10): Promise<Movie[]> {
  await ensureMoviesTable();

  const result = await pool.query<Movie>(
    `
      SELECT id, title, description, year
      FROM movies
      ORDER BY year DESC, title ASC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function searchMovies(q: string, field: SearchField): Promise<Movie[]> {
  await ensureMoviesTable();

  const trimmed = q.trim();

  if (!trimmed) {
    return getDefaultMovies(20);
  }

  if (field === "year") {
    const year = Number(trimmed);

    if (!Number.isInteger(year)) {
      return [];
    }

    const result = await pool.query<Movie>(
      `
        SELECT id, title, description, year
        FROM movies
        WHERE year = $1
        ORDER BY title ASC
      `,
      [year]
    );

    return result.rows;
  }

  const pattern = `%${trimmed}%`;

  if (field === "title") {
    const result = await pool.query<Movie>(
      `
        SELECT id, title, description, year
        FROM movies
        WHERE title ILIKE $1
        ORDER BY year DESC, title ASC
      `,
      [pattern]
    );

    return result.rows;
  }

  if (field === "description") {
    const result = await pool.query<Movie>(
      `
        SELECT id, title, description, year
        FROM movies
        WHERE description ILIKE $1
        ORDER BY year DESC, title ASC
      `,
      [pattern]
    );

    return result.rows;
  }

    if (field === "all") {
      const result = await pool.query<Movie>(
        `
          SELECT id, title, description, year
          FROM movies
          WHERE title ILIKE $1
            OR description ILIKE $1
            OR year::text ILIKE $1
          ORDER BY year DESC, title ASC
        `,
        [pattern]
      );

      return result.rows;
  }

  const result = await pool.query<Movie>(
    `
      SELECT id, title, description, year
      FROM movies
      WHERE title ILIKE $1
         OR description ILIKE $1
      ORDER BY year DESC, title ASC
    `,
    [pattern]
  );

  return result.rows;
}
