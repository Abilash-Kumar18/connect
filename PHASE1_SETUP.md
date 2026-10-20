# Phase 1 - Backend Foundation Setup Guide

This guide walks you through the manual setup steps required for Phase 1 of CONNECT.

## 1. Dependencies Installed

The following packages have been installed:
- `socket.io` & `socket.io-client` - WebSocket real-time communication
- `@supabase/supabase-js` - Supabase client
- `ioredis` - Redis client
- `jsonwebtoken` - JWT authentication
- `cors`, `helmet`, `morgan`, `compression` - Security & middleware
- `zod`, `uuid`, `bcrypt` - Validation, IDs, and password hashing

## 2. Supabase Database Setup

### Step 2.1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in and click "New Project"
3. Choose your organization
4. Fill in:
   - **Name**: `connect-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it)
   - **Region**: Choose closest to your users
5. Click "Create new project" (will take ~2 minutes)

### Step 2.2: Get Environment Variables
From Project Settings > API:
- `Project URL` → `SUPABASE_URL`
- `anon public` key → `SUPABASE_ANON_KEY`
- `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 2.3: Database Schema Setup

Go to SQL Editor in Supabase and run the following schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  status_state VARCHAR(20) DEFAULT 'offline' CHECK (status_state IN ('online', 'away', 'busy', 'offline')),
  status_text TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  icon VARCHAR(50) DEFAULT 'MessageCircle',
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP WITH TIME ZONE,
  currency VARCHAR(10) DEFAULT '₹',
  color_theme VARCHAR(50),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel members (for friend pairs and future scaling)
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_msg_id UUID UNIQUE NOT NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'text',
  is_important BOOLEAN DEFAULT FALSE,
  is_pinned_in_chat BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
  reactions JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB, -- For expense, meeting, attachment, poll, contact, sticker data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id_created_at ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_channel_id_id ON messages(channel_id, id);
CREATE INDEX idx_channels_last_message_at ON channels(last_message_at DESC);
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - will be refined with auth)
-- Allow authenticated users to read/write their own data
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::UUID = id);

CREATE POLICY "Users can view channels they belong to" ON channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM channel_members WHERE channel_members.channel_id = channels.id AND channel_members.user_id = auth.uid()::UUID)
);
CREATE POLICY "Users can create channels" ON channels FOR INSERT WITH CHECK (auth.uid()::UUID = created_by);

CREATE POLICY "Channel members can view members" ON channel_members FOR SELECT USING (true);

CREATE POLICY "Users can view messages in their channels" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM channel_members WHERE channel_members.channel_id = messages.channel_id AND channel_members.user_id = auth.uid()::UUID)
);
CREATE POLICY "Users can send messages to their channels" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()::UUID AND
  EXISTS (SELECT 1 FROM channel_members WHERE channel_members.channel_id = messages.channel_id AND channel_members.user_id = auth.uid()::UUID)
);
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (sender_id = auth.uid()::UUID);
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (sender_id = auth.uid()::UUID);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Redis Setup

### Option A: Upstash (Free Tier Available) - Recommended
1. Go to [https://upstash.com](https://upstash.com)
2. Sign in and create a new Redis database
3. Choose region closest to you
4. Copy the `Redis URL` (starts with `rediss://`) - this is your `REDIS_URL`

### Option B: Redis Cloud
1. Go to [https://redis.com/redis-enterprise-cloud](https://redis.com/redis-enterprise-cloud/)
2. Create free database
3. Get connection string

### Option C: Local Redis (Development)
```bash
# Windows (WSL2 or via chocolatey)
choco install redis-64

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```
Local Redis URL: `redis://localhost:6379`

## 4. Environment Variables

Create `.env.local` in the project root with:

```env
# Server Config
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Redis
REDIS_URL=your_redis_url_here

# JWT
JWT_SECRET=generate_a_secure_random_string_min_32_chars
JWT_EXPIRES_IN=7d

# Client Config (exposed)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SOCKET_URL=http://localhost:3000
```

**Generate JWT_SECRET**: You can generate with `openssl rand -base64 32` or any secure random generator.

## 5. Next Steps

After completing setup above:
1. Verify database tables created in Supabase Table Editor
2. Test Redis connection
3. We'll proceed to update `server.js` with Socket.io integration
4. Create authentication middleware and Socket.io event handlers
