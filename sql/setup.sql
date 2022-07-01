-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`

DROP TABLE IF EXISTS list;
DROP TABLE IF EXISTS users CASCADE; 

CREATE TABLE list (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT, 
  description VARCHAR NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL
);