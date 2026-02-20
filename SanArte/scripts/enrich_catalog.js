
import { createClient } from '@supabase/supabase-js';
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
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim();
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ARCHETYPES DEFINITION ---
const ARCHETYPES = {
    DIGESTIVE: {
        keywords: ['estomago', 'estómago', 'colon', 'intestino', 'higado', 'hígado', 'gastritis', 'digestion', 'boca', 'dientes', 'encias', 'encías', 'vesicula', 'páncreas', 'pancreas', 'abdomen', 'recto', 'ano'],
        content: {
            physicalAdvice: [
                "Dieta alcalina: Reduce ácidos y café por 3 días.",
                "Masticación consciente: Come sin pantallas y mastica 20 veces.",
                "Infusiones digestivas después de comer.",
                "Evita comer alimentos pesados antes de dormir."
            ],
            naturalRemedies: "Aloe Vera, Jugo de papa cruda (para acidez), Carbón activado.",
            aromatherapy: [
                { name: "Limón", benefit: "Depurativo y digestivo." },
                { name: "Menta", benefit: "Alivia pesadez y estimula." }
            ],
            meditationScript: "Imagina un fuego suave violeta en tu plexo solar (boca del estómago). Siente cómo este fuego transmuta y digiere cualquier emoción atascada, convirtiéndola en energía pura.",
            conflictList: [
                { conflict: "Lo 'indigesto'", manifestation: "Situaciones que no acepto o no puedo tragar." },
                { conflict: "Rabia o Rencor", manifestation: "Acumular ira en las 'entrañas'." }
            ],
            internalMonologue: "Cierro los ojos, respiro y suelto. No necesito controlar todo. Confío en que la vida me nutre.",
            actionPlan: [
                "Escribe una carta a lo que te enoja y quémala.",
                "Haz una comida en completo silencio hoy.",
                "Practica decir 'No' a una situación que no quieres 'tragar'."
            ],
            finalMessage: "Tu digestión refleja tu capacidad de aceptar la vida. Suelta el control y nutrete."
        }
    },
    STRUCTURAL: {
        keywords: ['huesos', 'espalda', 'rodillas', 'artritis', 'vertebras', 'vértebras', 'columna', 'hombros', 'cervicales', 'lumbares', 'cadera', 'pies', 'dedos', 'esqueleto', 'articulaciones', 'juanetes', 'hernia', 'discal', 'ciatica', 'ciática', 'musculos', 'músculos', 'tendon', 'tendón'],
        content: {
            physicalAdvice: [
                "Movimiento suave: Yoga o Tai Chi para lubricar articulaciones.",
                "Calor local en zonas de dolor crónico.",
                "Caminar descalzo sobre pasto o tierra (Earthing).",
                "Postura consciente al sentarse."
            ],
            naturalRemedies: "Cúrcuma con pimienta (antiinflamatorio), Cola de caballo, Baños de sal Epsom.",
            aromatherapy: [
                { name: "Romero", benefit: "Activa la circulación y da fuerza." },
                { name: "Gaulteria", benefit: "Alivio profundo del dolor muscular/óseo." }
            ],
            meditationScript: "Visualiza que eres un árbol antiguo. Tus pies son raíces profundas que entran en la tierra. Siente la estabilidad y el soporte de la Madre Tierra sosteniéndote. Eres flexible ante el viento, pero fuerte en tu centro.",
            conflictList: [
                { conflict: "Desvalorización", manifestation: "Sentir que 'no valgo' o 'no puedo soportarlo'." },
                { conflict: "Falta de Apoyo", manifestation: "Creer que debo cargar todo solo." },
                { conflict: "Rigidez Mental", manifestation: "Miedo a ceder o cambiar de dirección." }
            ],
            internalMonologue: "Soy fuerte y flexible. Tengo derecho a estar aquí. La vida me sostiene.",
            actionPlan: [
                "Pide ayuda explícita a alguien hoy.",
                "Haz 5 minutos de estiramientos al despertar.",
                "Repite: 'Me apruebo a mí mismo' frente al espejo."
            ],
            finalMessage: "Tu estructura es sagrada. No necesitas cargar el peso del mundo."
        }
    },
    SKIN: {
        keywords: ['piel', 'acne', 'acné', 'dermatitis', 'eczema', 'psoriasis', 'urticaria', 'manchas', 'verrugas', 'herpes', 'cabello', 'uñas'],
        content: {
            physicalAdvice: [
                "Hidratación profunda: Bebe 2 litros de agua.",
                "Evita duchas muy calientes que resequen.",
                "Usa ropa de tejidos naturales (algodón).",
                "Exposición moderada al sol para vitamina D."
            ],
            naturalRemedies: "Aceite de Coco, Caléndula, Avena coloidal para baños.",
            aromatherapy: [
                { name: "Lavanda", benefit: "Calma la irritación y la ansiedad." },
                { name: "Árbol de Té", benefit: "Purificante y protector." }
            ],
            meditationScript: "Imagina una luz dorada recorriendo todo el borde de tu cuerpo, creando un escudo protector suave y flexible. En este espacio, estás seguro/a. Nada tóxico puede entrar, y tu luz brilla hacia afuera.",
            conflictList: [
                { conflict: "Conflicto de Separación", manifestation: "Sentirse separado de alguien amado o contacto no deseado." },
                { conflict: "Protección", manifestation: "Sentirse atacado o invadido." },
                { conflict: "Identidad", manifestation: "Miedo a mostrarse tal cual es." }
            ],
            internalMonologue: "Me siento cómodo/a en mi propia piel. Soy bello/a y estoy protegido/a.",
            actionPlan: [
                "Hazte un automasaje con aceite hoy.",
                "Declara un límite sano a alguien ('No' es una respuesta completa).",
                "Mírate al espejo y di 'Te Amo' a tus imperfecciones."
            ],
            finalMessage: "Tu piel es tu límite con el mundo. Hónrala y protégete con amor."
        }
    },
    RESPIRATORY: {
        keywords: ['pulmones', 'bronquios', 'asma', 'garganta', 'tos', 'resfriado', 'gripe', 'sinusitis', 'nariz', 'aire', 'alergias', 'faringe', 'laringe'],
        content: {
            physicalAdvice: [
                "Ejercicios de respiración profunda (Pranayama).",
                "Mantener el ambiente ventilado y húmedo.",
                "Cantar o tararear para vibrar la garganta.",
                "Evitar lácteos si hay mucha mucosidad."
            ],
            naturalRemedies: "Vahos de Eucalipto, Jengibre con miel y limón, Tomillo.",
            aromatherapy: [
                { name: "Eucalipto", benefit: "Abre las vías respiratorias." },
                { name: "Menta", benefit: "Despeja y refresca." }
            ],
            meditationScript: "Visualiza aire azul cristalino entrando por tu nariz, llenando tus pulmones de libertad y vida. Al exhalar, suelta humo gris con todos tus miedos y palabras no dichas. Eres libre.",
            conflictList: [
                { conflict: "Miedo a la Vida/Muerte", manifestation: "Sentir que 'me ahogo' en una situación." },
                { conflict: "Territorio", manifestation: "Sentirse invadido o sin espacio propio." },
                { conflict: "Comunicación", manifestation: "Palabras no dichas o secretos." }
            ],
            internalMonologue: "Inspiro la vida con confianza. Tengo derecho a mi espacio y a mi voz.",
            actionPlan: [
                "Sal a caminar y respira aire fresco por 10 minutos.",
                "Escribe aquello que no te atreves a decir.",
                "Ordena tu espacio personal (cuarto/escritorio) para sentir amplitud."
            ],
            finalMessage: "Respirar es confiar. Tienes derecho a ocupar tu lugar en el mundo."
        }
    },
    CARDIO: {
        keywords: ['corazon', 'corazón', 'sangre', 'venas', 'arterias', 'presion', 'tension', 'circulacion', 'infarto', 'taquicardia', 'varices'],
        content: {
            physicalAdvice: [
                "Caminatas suaves diarias.",
                "Reducir la sal y grasas saturadas.",
                "Conectar con la risa y el juego.",
                "Elevar las piernas 10 minutos al día."
            ],
            naturalRemedies: "Espino Blanco, Ajo, Infusión de Olivo.",
            aromatherapy: [
                { name: "Ylang Ylang", benefit: "Calma el corazón y reduce la presión." },
                { name: "Rosa", benefit: "Amor incondicional y consuelo." }
            ],
            meditationScript: "Lleva las manos a tu corazón. Siente su latido. Pum-pum. Es el ritmo de la vida amándote. Imagina una luz rosa que se expande desde tu pecho y envuelve a todos tus seres queridos, incluyéndote a ti.",
            conflictList: [
                { conflict: "Pérdida de Territorio/Amor", manifestation: "Sentir que pierdo mi casa o mi familia." },
                { conflict: "Desvalorización Afectiva", manifestation: "No sentirse amado." },
                { conflict: "Falta de Alegría", manifestation: "Vivir por obligación, sin 'chispa'." }
            ],
            internalMonologue: "Mi corazón es fuerte y está lleno de amor. La alegría circula libremente en mi vida.",
            actionPlan: [
                "Haz una actividad que te divierta (bailar, pintar, jugar).",
                "Abraza a alguien por 20 segundos.",
                "Agradece 3 cosas hermosas de tu vida hoy."
            ],
            finalMessage: "El amor es la mejor medicina. Vuelve a la alegría."
        }
    },
    REPRODUCTIVE: {
        keywords: ['utero', 'útero', 'ovarios', 'prostata', 'próstata', 'menstruacion', 'mama', 'seno', 'vagina', 'testiculos', 'sexualidad', 'infertilidad', 'quiste', 'mioma'],
        content: {
            physicalAdvice: [
                "Conectar con ciclos lunares/naturales.",
                "Baños de asiento con hierbas.",
                "Movimiento pélvico (danza).",
                "Calor en la zona pélvica."
            ],
            naturalRemedies: "Salvia, Maca, Aceite de Onagra.",
            aromatherapy: [
                { name: "Geranio", benefit: "Equilibrio hormonal y femenino." },
                { name: "Jazmín", benefit: "Sensualidad y creatividad." }
            ],
            meditationScript: "Visualiza tu zona creativa/reproductiva como un jardín fértil. Ve flores naranjas abriéndose allí. Es tu centro de poder, de creación y de placer. Eres sagrado/a.",
            conflictList: [
                { conflict: "Creación/Hijos", manifestation: "Conflictos con hijos (reales o simbólicos)." },
                { conflict: "Pareja/Sexualidad", manifestation: "Sentirse desvalorizado como hombre/mujer." },
                { conflict: "Pérdida", manifestation: "Duelo por alguien que se fue o no llegó." }
            ],
            internalMonologue: "Honro mi cuerpo y mi creatividad. Soy fuente de vida y placer.",
            actionPlan: [
                "Haz algo creativo hoy (cocinar, dibujar, escribir).",
                "Mímate físicamente.",
                "Revisa cómo están tus límites en la pareja/familia."
            ],
            finalMessage: "Tu energía creativa es poderosa. Úsala para crear la vida que deseas."
        }
    },
    URINARY: {
        keywords: ['riñones', 'orina', 'vejiga', 'cistitis', 'uretra'],
        content: {
            physicalAdvice: [
                "Beber abundante agua de calidad.",
                "Jugo de arándanos rojo.",
                "No retener las ganas de orinar.",
                "Mantener caliente la zona lumbar."
            ],
            naturalRemedies: "Cola de caballo, Gayuba, Barbas de maíz.",
            aromatherapy: [
                { name: "Enebro", benefit: "Purificación y limpieza." },
                { name: "Cedro", benefit: "Fortaleza y enraizamiento." }
            ],
            meditationScript: "Visualiza agua cristalina fluyendo por tu cuerpo, lavando cualquier miedo. El agua se lleva todo lo viejo. Siente cómo fluyes con la vida, sin retener nada tóxico.",
            conflictList: [
                { conflict: "Territorio", manifestation: "No poder marcar límites." },
                { conflict: "Miedos Existenciales", manifestation: "Miedo a perderlo todo." },
                { conflict: "Críticas Mal Digeridas", manifestation: "Sentirse juzgado." }
            ],
            internalMonologue: "Suelto mis miedos y fluyo. Mi territorio es seguro.",
            actionPlan: [
                "Revisa en qué área sientes que invaden tu espacio.",
                "Bebe un vaso de agua con intención de 'limpiar'.",
                "Pon límites claros hoy mismo."
            ],
            finalMessage: "Fluye como el agua. Eres libre de soltar lo viejo."
        }
    }
};

const DEFAULT_CONTENT = {
    physicalAdvice: ["Descanso adecuado.", "Hidratación consciente.", "Alimentación balanceada."],
    naturalRemedies: "Infusiones relajantes según tu gusto.",
    aromatherapy: [{ name: "Lavanda", benefit: "Equilibrio general." }],
    meditationScript: "Dedica unos minutos a sentir tu respiración. Inhala paz, exhala tensión. Tu cuerpo sabe sanar.",
    conflictList: [{ conflict: "Desequilibrio Emocional", manifestation: "El cuerpo expresa lo que la mente calla." }],
    internalMonologue: "Me escucho. Me atiendo. Me amo.",
    actionPlan: ["Tómate una pausa de 10 minutos.", "Pregúntate: ¿Qué necesito realmente?", "Haz algo amable por ti hoy."],
    finalMessage: "Tu cuerpo es tu templo. Cuídalo."
};

function detectArchetype(text) {
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const [key, archetype] of Object.entries(ARCHETYPES)) {
        for (const keyword of archetype.keywords) {
            if (lower.includes(keyword)) return key;
        }
    }
    return null;
}

async function enrich() {
    console.log("✨ Iniciando Enriquecimiento Inteligente del Catálogo...");

    // 1. Fetch all symptoms (up to 2000)
    const { data: symptoms, error } = await supabase
        .from('symptom_catalog')
        .select('*')
        .range(0, 2000);

    if (error) {
        console.error("Error fetching symptoms:", error);
        return;
    }

    console.log(`📚 Analizando ${symptoms.length} síntomas...`);

    let enrichedCount = 0;

    for (const symptom of symptoms) {
        let content = symptom.content;

        if (!content) {
            content = {
                name: symptom.name,
                shortDefinition: "Definición pendiente.",
                emotionalAnalysis: "Este síntoma requiere una mirada interior profunda.",
                conflictList: []
            };
        }

        const isGeneric = !content.conflictList || content.conflictList.length === 0 || (content.conflictList[0] && content.conflictList[0].conflict === 'Conflicto Emocional Principal');

        // Even if not generic, if it matches an archetype significantly better, we might want to merge advice.
        // But let's prioritize those with weak content (isGeneric or short arrays).
        if (!isGeneric && content.physicalAdvice && content.physicalAdvice.length > 2) {
            // Likely a "Top 20" curated item or one we already fixed. Skip to respect manual quality.
            continue;
        }

        const archetypeKey = detectArchetype(symptom.name + " " + (content.emotionalAnalysis || ""));
        const archetypeData = archetypeKey ? ARCHETYPES[archetypeKey].content : DEFAULT_CONTENT;

        // MERGE: Keep name, definition, emotional analysis. Replace advice/remedies.
        const newContent = {
            ...content,
            ...archetypeData,
            // Only keep conflictList from archetype if the existing one is empty or generic
            conflictList: (content.conflictList && content.conflictList.length > 0 && content.conflictList[0].conflict !== 'Conflicto Emocional Principal')
                ? content.conflictList
                : archetypeData.conflictList
        };

        // If we kept the generic conflict list but it was the "Conflicto Emocional Principal" one from expand_dictionary,
        // we might want to keep that SPECIFIC manifestation but add the archetype ones too?
        // Let's just append the archetype conflicts to the specific one if it exists
        if (content.conflictList && content.conflictList.length > 0 && content.conflictList[0].conflict === 'Conflicto Emocional Principal') {
            newContent.conflictList = [
                ...content.conflictList,
                ...archetypeData.conflictList
            ];
        }

        // Update DB
        const { error: upError } = await supabase
            .from('symptom_catalog')
            .update({ content: newContent })
            .eq('id', symptom.id);

        if (upError) {
            console.error(`❌ Error updating ${symptom.name}:`, upError.message);
        } else {
            console.log(`✅ Enriched: ${symptom.name} [Type: ${archetypeKey || 'GENERAL'}]`);
            enrichedCount++;
        }
    }

    console.log(`\n🎉 Completado! ${enrichedCount} síntomas enriquecidos.`);
}

enrich();
