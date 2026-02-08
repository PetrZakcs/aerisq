
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log(`URL: ${supabaseUrl}`);

    const testEmail = `test_${Date.now()}@aerisq.tech`;

    const { data, error } = await supabase
        .from('waitlist')
        .insert([
            { email: testEmail, interest: 'other' },
        ])
        .select();

    if (error) {
        console.error('Connection failed:', error.message);
        if (error.code === '42P01') {
            console.error('Hint: The table "waitlist" does not exist. Did you run the SQL migration script?');
        }
    } else {
        console.log('Success! Test record inserted:', data);

        // Cleanup
        const { error: deleteError } = await supabase
            .from('waitlist')
            .delete()
            .eq('email', testEmail);

        if (deleteError) {
            console.log('Notice: Could not delete test record (Row Level Security might prevent deletion, which is expected for anon users).');
        } else {
            console.log('Test record cleaned up.');
        }
    }
}

testConnection();
