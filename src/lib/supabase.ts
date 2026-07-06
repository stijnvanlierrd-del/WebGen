import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://jekeewmpllttknpbravg.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla2Vld21wbGx0dGtucGJyYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTY1ODYsImV4cCI6MjA5ODkzMjU4Nn0.mEXIySFIBnsvMRcj-eExprlJ5ZvdaXKj4kxRxxqayiY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
