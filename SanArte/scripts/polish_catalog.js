import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SETUP CREDENTIALS ---
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error("No se pudo leer .env.local");
    process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const firstEq = line.indexOf('=');
    if (firstEq > -1) {
        const key = line.substring(0, firstEq).trim();
        let val = line.substring(firstEq + 1).trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        envVars[key] = val;
    }
});

console.log("Found keys in .env.local:", Object.keys(envVars));

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];
const geminiKey = envVars['VITE_GEMINI_API_KEY'] || envVars['GOOGLE_API_KEY'] || envVars['GEMINI_API_KEY'];

console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Key present:", !!supabaseKey);
console.log("Gemini Key present:", !!geminiKey);

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error("❌ Faltan variables de entorno. Verifica .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
// Fallback models from geminiService.ts
const MODELS_TO_TRY = [
    "gemini-flash-lite-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
];

async function generateContent(symptomName) {
    const prompt = `
    Actúa como un Maestro Sanador Espiritual y Experto en Biodescodificación de talla mundial.
    Tu misión es sanar el alma de quien lee esto.
    
    Escribe una ficha EXTREMADAMENTE HERMOSA, POÉTICA y PROFUNDA para el síntoma: "${symptomName}".
    
    IMPORTANTE:
    - NO uses lenguaje médico frío ni técnico.
    - Habla directamente al SER, al ALMA de la persona.
    - Usa metáforas de naturaleza, luz, y energía.
    - El tono debe ser de AMOR INCONDICIONAL, compasión infinita y esperanza absoluta.
    - Haz que la persona se sienta comprendida en lo más profundo de su corazón, como si la conocieras de toda la vida.
    
    Formato JSON requerido (NO uses Markdown, solo JSON puro):
    {
        "emotionalMeaning": "Texto extenso (4-5 oraciones) que explique la raíz emocional con belleza y empatía. Empieza con 'Este síntoma es un mensaje de tu alma que...' o similar.",
        "shortDefinition": "Una frase poética y poderosa que resuma la esencia espiritual del síntoma (máximo 12 palabras).",
        "conflictList": [
            { "conflict": "Nombre Poético del Conflicto", "manifestation": "Descripción empática de cómo se siente esto en la vida diaria." },
            { "conflict": "Nombre Poético del Conflicto 2", "manifestation": "Descripción empática." }
        ],
        "biodecodingData": {
             "biologicalSense": "Explicación breve del propósito biológico sagrado de este síntoma.",
             "phases": "Fase del proceso."
        },
        "internalMonologue": "Un decreto poderoso y hermoso en primera persona ('Yo soy luz...', 'Yo merezco amor...').",
        "actionPlan": [
             "Paso 1 (emocional)",
             "Paso 2 (físico/simbólico)",
             "Paso 3 (espiritual)"
        ],
        "finalMessage": "Un mensaje de esperanza y amor incondicional.",
        "physicalAdvice": [
            "Consejo físico específico 1",
            "Consejo físico específico 2",
            "Consejo físico específico 3"
        ],
        "naturalRemedies": "Lista de plantas o remedios específicos para este síntoma.",
        "aromatherapy": [
            { "name": "Aceite Esencial 1", "benefit": "Beneficio emocional/físico." },
            { "name": "Aceite Esencial 2", "benefit": "Beneficio emocional/físico." }
        ],
        "meditationScript": "Un guion corto de visualización específica para sanar este síntoma."
    }
    `;

    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.warn(`[${modelName}] failed for ${symptomName}. Trying next...`);
            // If it's the last model, log error but return null
            if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                console.error(`ALL MODELS FAILED for ${symptomName}:`, JSON.stringify(e, null, 2));
            }
        }
    }
    return null;
}

// --- GOLDEN TEMPLATE GENERATOR (FALLBACK OF HIGH QUALITY) ---
function generateGoldenContent(name) {
    const isVowel = /^[aeiou]/i.test(name);

    // Poetic phrases parts
    const openings = [
        "Este síntoma es un susurro sagrado de tu cuerpo que busca tu atención.",
        "Tu alma está utilizando este lenguaje físico para pedirte una pausa.",
        "Más que una enfermedad, esto es un llamado profundo a volver a tu centro.",
        "Tu biología expresa lo que tu corazón ha callado por demasiado tiempo.",
        "Este malestar es el mapa hacia una herida que está lista para sanar."
    ];

    const emotionalRoots = [
        "Suele manifestarse cuando sentimos que hemos perdido el control de nuestro territorio, ya sea emocional o físico.",
        "Aparece frecuentemente en momentos de desconexión con nuestra propia esencia y necesidades básicas.",
        "Resuena con un conflicto de desvalorización profunda, donde sentimos que no somos suficientes.",
        "Está vinculado a emociones de resistencia y rigidez ante los cambios inevitables de la vida.",
        "Refleja una necesidad no satisfecha de seguridad, protección y dulzura materna."
    ];

    const closings = [
        "Es momento de abrazar esta parte de ti con compasión infinita.",
        "Permítete sentir, soltar y confiar en que la vida te sostiene.",
        "Tu cuerpo no te ataca, te protege. Agradécele y suelta el miedo.",
        "La sanación comienza cuando dejas de luchar y empiezas a amar lo que eres."
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
        emotionalMeaning: `**${name}**: ${pick(openings)}\n\n${pick(emotionalRoots)}\n\n${pick(closings)}`,
        shortDefinition: `Mensaje sagrado de tu cuerpo para volver al amor.`,
        conflictList: [
            { conflict: "Resistencia Emocional", manifestation: "Sentir que luchas contra la corriente de tu propia vida." },
            { conflict: "Necesidad de Paz", manifestation: "Un grito silencioso por calma y seguridad interior." }
        ],
        biodecodingData: {
            biologicalSense: "Programa biológico de supervivencia que busca adaptar tu cuerpo a una situación de estrés emocional.",
            phases: "Fase de reparación y toma de consciencia."
        },
        internalMonologue: "Me perdono, me acepto y elijo sanar con amor.",
        actionPlan: [
            "Coloca tus manos sobre la zona y envíale luz dorada.",
            "Pregúntate: ¿Qué estoy tolerando que ya no resuena conmigo?",
            "Dedica 10 minutos hoy a no hacer nada, solo SER."
        ],
        finalMessage: "Eres luz infinita viviendo una experiencia humana. Todo está bien.",
        physicalAdvice: [
            "Hidratación consciente con intención de limpieza.",
            "Descanso profundo sin pantallas antes de dormir.",
            "Respiración conectada durante 5 minutos."
        ],
        naturalRemedies: "Infusión de Manzanilla y Lavanda para calmar el sistema.",
        aromatherapy: [
            { name: "Lavanda", benefit: "Paz profunda y aceptación." },
            { name: "Bergamota", benefit: "Luz y alegría para el corazón." }
        ],
        meditationScript: `Cierra los ojos. Visualiza una luz cálida y sanadora envolviendo tu ser, especialmente la zona de ${name.toLowerCase()}. Siente cómo esa luz disuelve cualquier tensión, cualquier miedo. Repite conmigo: 'Estoy a salvo. Soy amado. Soy libre'.`
    };
}

async function polish() {
    console.log("💎 Iniciando Pulido del Catálogo (Híbrido IA/Golden)...");

    // 1. Fetch targeted symptoms
    // Logic: content is null OR content->>shortDefinition contains "pendiente"
    // Since JSON filtering is tricky with raw JS client sometimes, let's fetch a chunk and filter locally.
    const { data: symptoms, error } = await supabase
        .from('symptom_catalog')
        .select('*')
        .range(0, 5000); // Grab all

    if (error) {
        console.error("Error fetching symptoms:", error);
        return;
    }

    const targets = symptoms.filter(s => {
        if (!s.content) return true;
        if (s.content.shortDefinition?.includes("pendiente")) return true;
        if (s.content.emotionalAnalysis?.includes("mirada interior")) return true; // Generic placeholder
        return false;
    });

    console.log(`🎯 Encontrados ${targets.length} síntomas pendientes de pulir.`);

    let successCount = 0;

    for (const symptom of targets) {
        console.log(`✨ Generando para: ${symptom.name}...`);

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

        const aiContent = await generateContent(symptom.name);

        let newContent;
        if (aiContent) {
            newContent = {
                name: symptom.name,
                ...aiContent,
                physicalAdvice: aiContent.physicalAdvice || ["Descanso y conexión interior."],
                naturalRemedies: aiContent.naturalRemedies || "Infusiones relajantes.",
                aromatherapy: aiContent.aromatherapy || [{ name: "Lavanda", benefit: "Calma universal." }],
                meditationScript: aiContent.meditationScript || "Respira profundo. Siente paz."
            };
        } else {
            console.log(`⚠️ IA falló para ${symptom.name}. Usando Golden Template.`);
            const golden = generateGoldenContent(symptom.name);
            newContent = { name: symptom.name, ...golden };
        }

        if (newContent) {
            const { error: upError } = await supabase
                .from('symptom_catalog')
                .update({ content: newContent })
                .eq('id', symptom.id);

            if (upError) {
                console.error(`❌ Error updating ${symptom.name}:`, upError.message);
            } else {
                console.log(`✅ Pulido: ${symptom.name} [${aiContent ? 'IA' : 'Golden'}]`);
                successCount++;
            }
        }
    }

    console.log(`\n💎 Completado! ${successCount} síntomas pulidos.`);
}

polish();
