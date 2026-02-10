import Database from "better-sqlite3";
import path from "node:path";

export type Movie = {
  title: string;
  description: string;
  year: number;
};

export type SearchField = "title" | "description" | "year";

const SAMPLE_MOVIES: Movie[] = [
  { title: "The Shawshank Redemption", description: "Two imprisoned men form an enduring friendship while hoping for freedom.", year: 1994 },
  { title: "The Godfather", description: "The aging patriarch of a crime dynasty transfers control to his reluctant son.", year: 1972 },
  { title: "The Dark Knight", description: "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos.", year: 2008 },
  { title: "Pulp Fiction", description: "Interwoven stories of criminals, hitmen, and redemption in Los Angeles.", year: 1994 },
  { title: "Forrest Gump", description: "A kind-hearted man witnesses and influences major moments in American history.", year: 1994 },
  { title: "Inception", description: "A thief enters dreams to steal secrets and attempts one impossible heist.", year: 2010 },
  { title: "Fight Club", description: "An insomniac and a soap maker form an underground club with dangerous consequences.", year: 1999 },
  { title: "The Matrix", description: "A hacker discovers reality is a simulation and joins a human rebellion.", year: 1999 },
  { title: "Goodfellas", description: "A young man rises through the mob ranks and pays a brutal price.", year: 1990 },
  { title: "The Lord of the Rings: The Fellowship of the Ring", description: "A hobbit begins a quest to destroy a powerful and corrupting ring.", year: 2001 },
  { title: "The Lord of the Rings: The Two Towers", description: "The fellowship is divided while war grows across Middle-earth.", year: 2002 },
  { title: "The Lord of the Rings: The Return of the King", description: "Allies make a final stand as Frodo nears Mount Doom.", year: 2003 },
  { title: "Interstellar", description: "Explorers travel through a wormhole to find a future for humanity.", year: 2014 },
  { title: "Gladiator", description: "A betrayed Roman general seeks justice in the arena.", year: 2000 },
  { title: "The Silence of the Lambs", description: "An FBI trainee consults a brilliant killer to catch another murderer.", year: 1991 },
  { title: "Se7en", description: "Two detectives hunt a serial killer obsessed with the seven deadly sins.", year: 1995 },
  { title: "Saving Private Ryan", description: "A squad risks everything to retrieve a paratrooper behind enemy lines.", year: 1998 },
  { title: "The Green Mile", description: "Prison guards encounter a death-row inmate with extraordinary powers.", year: 1999 },
  { title: "Whiplash", description: "A driven drummer is pushed to extremes by a relentless instructor.", year: 2014 },
  { title: "Parasite", description: "A poor family infiltrates a wealthy household in a dark social satire.", year: 2019 },
  { title: "The Departed", description: "An undercover cop and a mole race to expose each other.", year: 2006 },
  { title: "No Country for Old Men", description: "A hunter finds drug money and triggers a ruthless pursuit.", year: 2007 },
  { title: "The Prestige", description: "Rival magicians sacrifice everything to outdo one another.", year: 2006 },
  { title: "Memento", description: "A man with short-term memory loss hunts his wife's killer.", year: 2000 },
  { title: "Django Unchained", description: "A freed slave teams with a bounty hunter to rescue his wife.", year: 2012 },
  { title: "The Social Network", description: "The rise of Facebook sparks ambition, lawsuits, and betrayal.", year: 2010 },
  { title: "Mad Max: Fury Road", description: "A runaway warrior helps rebels escape a tyrant across the wasteland.", year: 2015 },
  { title: "Blade Runner 2049", description: "A new blade runner uncovers a secret that could upend society.", year: 2017 },
  { title: "The Grand Budapest Hotel", description: "A hotel concierge and his protege are swept into a stolen-art mystery.", year: 2014 },
  { title: "The Lion King", description: "A lion cub must reclaim his kingdom after family tragedy.", year: 1994 },
  { title: "Spirited Away", description: "A young girl enters a spirit world and fights to save her parents.", year: 2001 },
  { title: "Toy Story", description: "A cowboy doll and a space toy compete, then become allies.", year: 1995 },
  { title: "Up", description: "An elderly widower lifts his house with balloons and seeks adventure.", year: 2009 },
  { title: "WALL-E", description: "A lonely robot on Earth discovers love and a mission.", year: 2008 },
  { title: "Coco", description: "A boy journeys to the Land of the Dead to uncover family history.", year: 2017 },
  { title: "The Incredibles", description: "A family of superheroes returns to action to stop a new threat.", year: 2004 },
  { title: "Shrek", description: "An ogre and a talking donkey rescue a princess in a twisted fairytale.", year: 2001 },
  { title: "Finding Nemo", description: "A timid clownfish crosses the ocean to find his kidnapped son.", year: 2003 },
  { title: "Arrival", description: "A linguist attempts to communicate with mysterious visitors from space.", year: 2016 },
  { title: "Her", description: "A lonely writer develops an intimate bond with an AI assistant.", year: 2013 },
  { title: "La La Land", description: "An actress and a jazz musician chase dreams and test their relationship.", year: 2016 },
  { title: "The Truman Show", description: "A man slowly realizes his entire life is a television production.", year: 1998 },
  { title: "Eternal Sunshine of the Spotless Mind", description: "A couple erases painful memories but struggles to let go.", year: 2004 },
  { title: "The Wolf of Wall Street", description: "A stockbroker's rise and excess spiral into crime and downfall.", year: 2013 },
  { title: "Alien", description: "A spaceship crew faces a deadly lifeform stalking them in deep space.", year: 1979 },
  { title: "Jaws", description: "A small beach town is terrorized by a giant shark.", year: 1975 },
  { title: "Back to the Future", description: "A teenager travels to the past and risks his own existence.", year: 1985 },
  { title: "The Empire Strikes Back", description: "The rebellion suffers heavy losses while Luke trains as a Jedi.", year: 1980 },
  { title: "Raiders of the Lost Ark", description: "An archaeologist races Nazis to recover a legendary biblical artifact.", year: 1981 },
  { title: "Casablanca", description: "A cynical club owner must choose between love and resistance.", year: 1942 }
];

const dbPath = path.join(process.cwd(), "movies.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    year INTEGER NOT NULL
  )
`);

const countStmt = db.prepare("SELECT COUNT(*) AS count FROM movies");
const insertStmt = db.prepare(
  "INSERT INTO movies (title, description, year) VALUES (@title, @description, @year)"
);

if ((countStmt.get() as { count: number }).count === 0) {
  const seedMovies = db.transaction((movies: Movie[]) => {
    for (const movie of movies) {
      insertStmt.run(movie);
    }
  });

  seedMovies(SAMPLE_MOVIES);
}

const searchByTitleStmt = db.prepare(`
  SELECT title, description, year
  FROM movies
  WHERE title LIKE @query
  ORDER BY year DESC, title ASC
`);

const searchByDescriptionStmt = db.prepare(`
  SELECT title, description, year
  FROM movies
  WHERE description LIKE @query
  ORDER BY year DESC, title ASC
`);

const searchByYearStmt = db.prepare(`
  SELECT title, description, year
  FROM movies
  WHERE year = @year
  ORDER BY title ASC
`);

export function searchMovies(query: string, field: SearchField): Movie[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  if (field === "year") {
    const year = Number(trimmed);

    if (!Number.isInteger(year)) {
      return [];
    }

    return searchByYearStmt.all({ year }) as Movie[];
  }

  if (field === "title") {
    return searchByTitleStmt.all({ query: `%${trimmed}%` }) as Movie[];
  }

  return searchByDescriptionStmt.all({ query: `%${trimmed}%` }) as Movie[];
}

export { db };
