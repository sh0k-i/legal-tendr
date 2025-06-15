-- Create schema for legal-tendr app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('client', 'lawyer', 'admin')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_picture_url TEXT,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lawyers table
CREATE TABLE lawyers (
  lawyer_id UUID PRIMARY KEY REFERENCES users(user_id),
  bio TEXT,
  matches_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  hourly_rate INTEGER NOT NULL,
  years_of_experience INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  client_id UUID PRIMARY KEY REFERENCES users(user_id),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialties table
CREATE TABLE specialties (
  specialty_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Lawyer specialties (junction table)
CREATE TABLE lawyer_specialties (
  lawyer_id UUID REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(specialty_id) ON DELETE CASCADE,
  PRIMARY KEY (lawyer_id, specialty_id)
);

-- Lawyer service areas
CREATE TABLE lawyer_service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
  zip_code VARCHAR(20) NOT NULL
);

-- ZIP codes table
CREATE TABLE zip_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code VARCHAR(20) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL
);

-- Cases table
CREATE TABLE cases (
  case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  hired_lawyer_id UUID REFERENCES lawyers(lawyer_id),
  status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case categories (junction table)
CREATE TABLE case_categories (
  case_id UUID REFERENCES cases(case_id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(specialty_id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, specialty_id)
);

-- Matches table
CREATE TABLE matches (
  match_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
  is_mutual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, lawyer_id)
);

-- Conversations table
CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, lawyer_id)
);

-- Messages table
CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lawyers_hourly_rate ON lawyers(hourly_rate);
CREATE INDEX idx_lawyers_rating ON lawyers(rating);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_lawyer_specialties_lawyer ON lawyer_specialties(lawyer_id);
CREATE INDEX idx_lawyer_specialties_specialty ON lawyer_specialties(specialty_id);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lawyers_modtime
BEFORE UPDATE ON lawyers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_clients_modtime
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cases_modtime
BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_conversations_modtime
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
