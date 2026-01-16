const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// --- MANUALLY READ .ENV.LOCAL ---
const envPath = path.resolve(__dirname, '../.env.local');
let envConfig = {};

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim().replace(/"/g, ''); // Simple cleanup
        }
    });
} catch (e) {
    console.warn("⚠️ No se pudo leer .env.local: ", e.message);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Faltan credenciales (VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log("🚀 Iniciando migración de Avatar (CommonJS)...");

    // 1. ADD COLUMN TO PROFILES
    // Note: Since we don't have direct SQL access easily via JS client without RPC, 
    // we are hoping the column might already exist or we skip to storage.
    // If the user hasn't added it manually, this step is just a "best effort" via RPC if 'execute_sql' exists.

    const { error: colError } = await supabase.rpc('execute_sql', {
        sql_query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;`
    }).catch(e => ({ error: e }));

    if (colError) {
        console.warn("⚠️ (Ignorable) No se pudo ejecutar SQL directo. Asegúrate de añadir 'avatar_url' a la tabla 'profiles' manualmente si no existe.");
    } else {
        console.log("✅ Columna 'avatar_url' verificada.");
    }

    // 2. CREATE STORAGE BUCKET
    console.log("--> Creando Bucket 'avatars'...");
    const { data, error: bucketError } = await supabase
        .storage
        .createBucket('avatars', {
            public: true,
            fileSizeLimit: 1048576, // 1MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });

    if (bucketError) {
        if (bucketError.message.includes("already exists") || bucketError.message.includes("Duplicate")) {
            console.log("✅ Bucket 'avatars' ya existe.");
        } else {
            console.error("❌ Error creando bucket:", bucketError.message);
        }
    } else {
        console.log("✅ Bucket 'avatars' creado exitosamente.");
    }

    console.log("\n✨ Script finalizado.");
}

runMigration();
