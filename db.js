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

// Default Super Admin Record Definition
const SUPER_ADMIN_RECORD = {
  id: 'adm_super_01',
  userId: 'kogniti14',
  name: 'Honey Sharma',
  email: 'kogniti14@kognitiminds.com',
  password: '28022007Honey@#',
  role: 'super_admin',
  department: 'Executive Leadership & Governance',
  status: 'approved',
  registeredAt: '2026-08-01T09:00:00Z',
  approvedAt: '2026-08-01T09:00:00Z',
};

async function testConnection() {
  try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.log('Supabase: Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) pending in Hostinger environment.');
      return;
    }

    console.log('Supabase: Verifying database connection on Hostinger...');

    // 1. Check connection on standard tables (admin_users or users)
    const { data: adminData, error: adminErr } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (!adminErr) {
      console.log('Supabase: Connected successfully. Checking admin_users table...');
      // Ensure Super Admin account exists without creating duplicates
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id, userId, email, role')
        .or('userId.eq.kogniti14,email.eq.kogniti14@kognitiminds.com')
        .limit(1);

      if (!existingAdmin || existingAdmin.length === 0) {
        console.log('Supabase: Seeding Super Admin account into admin_users...');
        await supabase.from('admin_users').upsert(SUPER_ADMIN_RECORD, { onConflict: 'userId' });
        console.log('Supabase: Super Admin account seeded successfully.');
      } else {
        console.log('Supabase: Verified existing Super Admin account is present:', existingAdmin[0].userId);
      }
    } else {
      // Fallback check on users table
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*').limit(1);
      if (usersErr) {
        console.log('Supabase connection check note:', adminErr.message || usersErr.message);
      } else {
        console.log('Supabase connected successfully to users table.');
      }
    }
  } catch (err) {
    console.log('Supabase testConnection note:', err.message);
  }
}

testConnection();

export { supabase, testConnection, SUPER_ADMIN_RECORD };
export default supabase;
