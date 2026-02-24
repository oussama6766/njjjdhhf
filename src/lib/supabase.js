import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wedwuoficfkwnxfmtjtf.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZHd1b2ZpY2Zrd254Zm10anRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTU4MjcsImV4cCI6MjA4NDk5MTgyN30.RA59aRnGuyJ8QRFlECZ8qwHsRDpqiJBST0LVX1wzLMU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
