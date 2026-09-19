import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client using environment variables provided by Hostinger
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

async function testConnection() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase: Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) pending in Hostinger environment.');
      return;
    }
    // Replaced 'your_table' with 'users' (standard Supabase table)
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.log('Supabase connection check:', error.message);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (err) {
    console.log('Supabase testConnection note:', err.message);
  }
}

testConnection();

export { supabase, testConnection };
export default supabase;
