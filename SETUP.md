# Environment Setup

To use the profile system with Supabase, you need to set up environment variables.

## 1. Create `.env.local` file

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Thirdweb Configuration (optional)
# Get this from https://thirdweb.com/create-api-key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
```

## 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env.local` file

## 3. Create Database Table

In your Supabase SQL editor, run this query to create the profiles table:

```sql
CREATE TABLE profiles (
  wallet_address TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = wallet_address);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = wallet_address);
```

## 4. Thirdweb Setup (Optional)

1. Go to [thirdweb.com/create-api-key](https://thirdweb.com/create-api-key)
2. Create a new API key
3. Add the client ID to your `.env.local` file

## 5. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## Features

Once configured, the app will:

1. **Auto-detect wallet connection**: When a user connects their wallet, the system checks if they have a profile
2. **Show ProfileSetupCard**: If no profile exists, a modal appears to create one
3. **Save to Supabase**: Profile data is saved to your Supabase database
4. **Display in sidebar**: The profile information appears in the dashboard sidebar
5. **Copy wallet address**: Users can copy their full wallet address with a click 