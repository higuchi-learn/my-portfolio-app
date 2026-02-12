CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tech_stack TEXT,
  repository_url TEXT,
  site_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

INSERT INTO posts (id, slug, title, description, content, tags, status, created_at, updated_at) VALUES
('1', 'post-test', 'test to My Blog', 'This is the first post on my new blog!', 'Hello everyone! This is my first post. Stay tuned for more content.', 'introduction, welcome', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
