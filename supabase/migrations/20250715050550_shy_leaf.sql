/*
  # Create user_filters table for onboarding data

  1. New Tables
    - `user_filters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `question_1` (text)
      - `question_2` (text) 
      - `question_3` (text)
      - `question_4` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_filters` table
    - Add policies for authenticated users to manage their own data
*/

-- Create user_filters table
CREATE TABLE IF NOT EXISTS user_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_1 text NOT NULL,
  question_2 text NOT NULL,
  question_3 text NOT NULL,
  question_4 text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_filters ENABLE ROW LEVEL SECURITY;

-- Create policies for user_filters
CREATE POLICY "Users can view their own filters"
  ON user_filters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters"
  ON user_filters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters"
  ON user_filters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters"
  ON user_filters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_filters_user_id ON user_filters(user_id);