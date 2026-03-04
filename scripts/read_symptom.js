import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SETUP CREDENTIALS ---
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

async function read() {
    // Buscar uno que sabemos que existía como pendiente
    // Usamos 'CÁNCER DE LA LENGUA' porque lo vimos en los logs
    const { data, error } = await supabase
        .from('symptom_catalog')
        .select('*')
        .ilike('name', '%LENGUA%')
        .limit(1);

    if (error) console.error(error);
    else {
        console.log(JSON.stringify(data[0]?.content, null, 2));
    }
}

read();
