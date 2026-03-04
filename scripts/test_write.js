import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const firstEq = line.indexOf('=');
    if (firstEq > -1) {
        const key = line.substring(0, firstEq).trim();
        let val = line.substring(firstEq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        envVars[key] = val;
    }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWrite() {
    console.log("Testing write to AMEBIASIS...");

    // First, get ID
    const { data: symptoms } = await supabase.from('symptom_catalog').select('id, content').ilike('name', '%AMEBIASIS%').limit(1);

    if (!symptoms || !symptoms.length) {
        console.error("Symptom not found");
        return;
    }

    const id = symptoms[0].id;
    console.log("Found ID:", id);

    // Update
    const newContent = { ...symptoms[0].content, testField: "WRITTEN_BY_TEST_SCRIPT_" + Date.now() };

    const { data, error, count } = await supabase
        .from('symptom_catalog')
        .update({ content: newContent })
        .eq('id', id)
        .select();

    if (error) {
        console.error("❌ Write Error:", error);
    } else {
        console.log("✅ Write Success. Returned rows:", data?.length);
        if (data?.length === 0) console.log("⚠️ 0 rows returned (RLS silent block?)");
    }
}

testWrite();
