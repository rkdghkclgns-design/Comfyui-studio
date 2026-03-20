import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pkwbqbxuujpcvndpacsc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrd2JxYnh1dWpwY3ZuZHBhY3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzU5NDEsImV4cCI6MjA4ODY1MTk0MX0.aBfkX90WuMmrk2kkICXGmKqnoQeGXYiK7HVsf_nQzGA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
