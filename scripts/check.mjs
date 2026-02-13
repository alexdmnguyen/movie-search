import pg from "pg";
const { Client } = pg;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
`);
console.log("Tables:", tables.rows.map(r => r.table_name));

const count = await client.query(`SELECT COUNT(*)::int AS n FROM movies;`);
console.log("movies row count:", count.rows[0].n);

const sample = await client.query(`SELECT id, title, year FROM movies ORDER BY year DESC, title ASC LIMIT 10;`);
console.log("sample rows:", sample.rows);

await client.end();
