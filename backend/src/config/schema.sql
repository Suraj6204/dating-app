CREATE TABLE users (
  id UUID PRIMARY KEY, --16 bit , not easily guessable
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

 CREATE TABLE profiles (
  id SERIAL PRIMARY KEY, -- 1,2,3... ; takes less storage
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  dob DATE NOT NULL,
  gender gender_enum NOT NULL,
  gender_preference gender_enum NOT NULL,
  location JSONB, 
  interests TEXT[],
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TYPE swipe_type AS ENUM('like','dislike');

CREATE TABLE swipes(
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type swipe_type NOT NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (sender_id , receiver_id) --dono ka pair unique chaiye taki same profile swipe krne ke baad dobara na dikhe 
);

CREATE TYPE swipe_type AS ENUM('like','dislike');

CREATE TABLE swipes(
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type swipe_type NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (sender_id , receiver_id) --dono ka pair unique chaiye taki same profile swipe krne ke baad dobara na dikhe 
);

-- Isse (sender_id, receiver_id) ka pair search karna super fast ho jayega
CREATE INDEX idx_swipes_match_lookup ON swipes (sender_id, receiver_id) WHERE type = 'like';

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_1, user_2)
);

