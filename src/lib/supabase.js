import { createClient } from "@supabase/supabase-js";

// joha-gallery project (etasxbaorwgjoofdxean) — migrated from the paused
// "NexGen ERP Platinum" project (pkwbqbxuujpcvndpacsc).
const SUPABASE_URL = "https://etasxbaorwgjoofdxean.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0YXN4YmFvcndnam9vZmR4ZWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzUwMDIsImV4cCI6MjA5MTI1MTAwMn0.x8gV5pPEflhTniecyVrBNvjedkuimVRBUjh3zvez_us";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
