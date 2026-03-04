
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load Environment Variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log("✅ Environment variables loaded from .env.local");
} else {
    console.warn("⚠️ .env.local not found");
}

async function verifyVulva() {
    console.log("🔍 Verifying 'Vulva' symptom generation...");

    try {
        // Dynamic import to ensure process.env is set before module load
        const module = await import('../services/geminiService.ts');
        const getFullSymptomDetails = module.getFullSymptomDetails;

        console.log("🚀 Service imported successfully.");
        const rawDetails = await getFullSymptomDetails('Vulva');
        const details = rawDetails as any;

        if (details.isFallback) {
            console.warn("⚠️  Returned FALLBACK data. This might be generic.");
        } else {
            console.log("✅ Returned AI generated data!");
        }

        console.log("\n--- Emotional Meaning ---");
        console.log(details.emotionalMeaning);

        if (details.emotionalMeaning && (details.emotionalMeaning.includes("sex") || details.emotionalMeaning.length > 50)) {
            console.log("\n✅ Content seems detailed and specific.");
        } else {
            console.warn("\n⚠️  Content might be too short or censored.");
        }

    } catch (error) {
        console.error("❌ Error generating details:", error);
    }
}

verifyVulva();
