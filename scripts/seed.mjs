import fs from "fs";
import pg from "pg";
import { parse } from "csv-parse/sync";

const { Client } = pg;

const dbUrl = process.env.DATABASE_URL;
console.log("Seeding DATABASE_URL =", dbUrl);

if (!dbUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

if (!fs.existsSync("movies.csv")) {
  console.error("movies.csv not found in project root");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // Create table (allow year nullable just in case)
  await client.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id INT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      year INT
    );
  `);

  // Optional: clear table to ensure clean seed
  await client.query(`TRUNCATE TABLE movies;`);

  const csvText = fs.readFileSync("movies.csv", "utf8");
  const records = parse(csvText, { bom: true, columns: true, skip_empty_lines: true, trim: true });

  console.log("CSV records:", records.length);
  console.log("First row:", records[0]);

  const insertSql = `INSERT INTO movies (id, title, description, year) VALUES ($1,$2,$3,$4);`;

  let inserted = 0;

  for (const r of records) {
    const id = parseInt(String(r.id).trim(), 10);
    const title = String(r.title ?? "").trim();
    const description = String(r.description ?? "").trim();
    const yearStr = String(r.year ?? "").trim();
    const year = yearStr ? parseInt(yearStr, 10) : null;

    // show what we're about to insert for the first few rows
    if (inserted < 3) console.log("Inserting:", { id, title, description, year });

    if (!Number.isFinite(id) || !title || !description) {
      console.log("Skipping row due to invalid fields:", r);
      continue;
    }

    await client.query(insertSql, [id, title, description, year]);
    inserted++;
  }

  const res = await client.query(`SELECT COUNT(*)::int AS n FROM movies;`);
  console.log(`Seed done. Inserted ${inserted}. Total in DB: ${res.rows[0].n}`);

  await client.end();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
