ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

UPDATE users
SET username = split_part(email, '@', 1)
WHERE username IS NULL OR username = '';

ALTER TABLE users ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
