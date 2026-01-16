import { GoogleGenerativeAI } from '@google/generative-ai';
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

const key = envVars['VITE_GEMINI_API_KEY'] || envVars['GOOGLE_API_KEY'] || envVars['GEMINI_API_KEY'];
if (key) {
    console.log(`Key found. Length: ${key.length}`);
    console.log(`First char code: ${key.charCodeAt(0)}`);
    console.log(`Last char code: ${key.charCodeAt(key.length - 1)}`);
    console.log(`Start: ${key.substring(0, 5)}...`);
} else {
    console.log("No key found in parsed envVars.");
}

const genAI = new GoogleGenerativeAI(key);

const MODELS = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro-latest", "gemini-1.0-pro"];

async function test() {
    console.log("Testing via RAW REST API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Body:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
