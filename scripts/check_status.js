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

async function check() {
    // Check pending count by fetching all and filtering (safest for JSONB without creating indexes)
    const { data, error } = await supabase
        .from('symptom_catalog')
        .select('content');

    if (error) {
        console.error(error);
        return;
    }

    const pending = data.filter(r =>
        !r.content ||
        (r.content.shortDefinition && r.content.shortDefinition.includes('pendiente')) ||
        (r.content.emotionalMeaning && r.content.emotionalMeaning.includes('mirada interior'))
    ).length;

    const total = data.length;
    const percent = ((total - pending) / total * 100).toFixed(1);

    console.log(`Total: ${total}`);
    console.log(`Pendientes: ${pending}`);
    console.log(`Progreso: ${percent}%`);
}

check();
