CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

CREATE TABLE profile(
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCS users(id) ON DELETE CASCADE,
  bio TEXT,
  dob Date NOT NULL,
  gender gender_enum NOT NULL,
  gender_preference gender_enum NOT NULL,
  location JSONB, -- { lat: 12.34, lng: 56.78 }
  interests TEXT[],
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)