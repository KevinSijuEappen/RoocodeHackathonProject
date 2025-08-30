-- User profiles table that integrates with Clerk
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk user ID
  zip_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(50),
  interests TEXT[], -- Array of interests like ['housing', 'transport', 'environment']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Update existing tables to reference user profiles
ALTER TABLE documents ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id);
ALTER TABLE chat_conversations ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id);