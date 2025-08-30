-- Community Transparency Digest Database Schema

-- Users table for personalization
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  zip_code VARCHAR(10),
  interests TEXT[], -- Array of interests like ['housing', 'transport', 'environment']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table for uploaded government documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  document_type VARCHAR(100), -- 'meeting_notes', 'policy', 'budget', etc.
  source_url VARCHAR(500),
  upload_date TIMESTAMP DEFAULT NOW(),
  zip_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(50),
  file_path VARCHAR(500),
  processed BOOLEAN DEFAULT FALSE
);

-- Processed insights from documents
CREATE TABLE document_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  category VARCHAR(100), -- 'housing', 'transport', etc.
  summary TEXT NOT NULL,
  impact_level INTEGER CHECK (impact_level >= 1 AND impact_level <= 5),
  key_points TEXT[],
  action_items TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Public comments and sentiment analysis
CREATE TABLE public_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  commenter_name VARCHAR(255),
  comment_text TEXT NOT NULL,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  sentiment_label VARCHAR(20), -- 'positive', 'negative', 'neutral'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comparative data for context
CREATE TABLE comparative_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  category VARCHAR(100), -- 'budget', 'crime', 'education', etc.
  metric_name VARCHAR(200),
  metric_value DECIMAL(15,2),
  year INTEGER,
  source VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  sources TEXT[], -- Array of source references
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forecasts and predictions
CREATE TABLE forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  category VARCHAR(100),
  prediction TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.0 to 1.0
  timeframe VARCHAR(50), -- '6 months', '1 year', '2 years'
  impact_areas TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_documents_zip_code ON documents(zip_code);
CREATE INDEX idx_documents_processed ON documents(processed);
CREATE INDEX idx_document_insights_category ON document_insights(category);
CREATE INDEX idx_public_comments_document_id ON public_comments(document_id);
CREATE INDEX idx_comparative_data_location ON comparative_data(city, state, zip_code);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);