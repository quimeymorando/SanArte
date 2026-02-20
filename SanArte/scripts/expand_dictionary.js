
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read .env.local manually
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

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan credenciales de Supabase en .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RAW_DATA = `
## **A**

**Abdomen** - Región del cuerpo entre tórax y pelvis que contiene órganos digestivos y reproductivos.
- *Biodecodificación*: Relacionado con la "digestión emocional", lo que no podemos "tragar" o "digerir" de la vida.

**Acné** - Enfermedad inflamatoria de la piel.
- *Biodecodificación*: Conflicto de desvalorización estética, dificultad para aceptarse, rechazo de la propia imagen.

**Alergias** - Reacción exagerada del sistema inmunológico.
- *Biodecodificación*: Resistencia o rechazo emocional a algo/situación/persona. "Lo que no quiero en mi territorio".

**Amígdalas** - Tejido linfoide en la garganta.
- *Biodecodificación*: Conflictos de "bocado" (palabras, alimento) que no puedo atrapar o rechazar. Protección ante invasiones.

**Anemia** - Disminución de glóbulos rojos o hemoglobina.
- *Biodecodificación*: Falta de alegría vital, desvalorización de la propia identidad, "no tengo derecho a vivir plenamente".

**Apéndice** - Pequeña estructura en el ciego intestinal.
- *Biodecodificación*: Conflicto de "obstrucción" emocional, algo que contamina mi vida y no puedo eliminar.

**Arterias** - Vasos que llevan sangre oxigenada del corazón.
- *Biodecodificación*: Conflicto de desvalorización en el territorio ("no puedo marcar mi espacio") o problemas con el "fluir" de la alegría.

**Artritis** - Inflamación de articulaciones.
- *Biodecodificación*: Crítica hacia uno mismo o los demás, rigidez mental, resistencia al cambio.

**Asma** - Enfermedad inflamatoria de las vías respiratorias.
- *Biodecodificación*: Miedo a la vida, sensación de sofocación emocional, conflicto territorial.

**Audición (oído)** - Sentido que permite percibir sonidos.
- *Biodecodificación*: "No quiero oír" algo, críticas, palabras que duelen.

---

## **B**

**Bazo** - Órgano linfoide que filtra sangre.
- *Biodecodificación*: Conflictos de desvalorización en la protección, preocupación por hijos o familia.

**Bronquios** - Conductos que llevan aire a los pulmones.
- *Biodecodificación*: Conflictos de territorio, peleas familiares, amenaza en el espacio vital.

---

## **C**

**Cabeza** - Parte superior del cuerpo que contiene cerebro y sentidos.
- *Biodecodificación*: Sede de la identidad. Cefaleas relacionadas con autocrítica, exceso de pensamiento.

**Cáncer** - Crecimiento celular descontrolado.
- *Biodecodificación*: Según el tejido afectado, suele relacionarse con conflictos emocionales muy profundos, vividos en aislamiento.

**Corazón** - Órgano muscular que bombea sangre.
- *Biodecodificación*: Conflictos de pérdida (territorio, personas), desvalorización en el amor, sobrecarga emocional.

**Colon** - Intestino grueso donde se forma las heces.
- *Biodecodificación*: Conflictos de "basura" emocional no eliminada, rencores antiguos, miedo a soltar.

**Cóccix** - Último hueso de la columna vertebral.
- *Biodecodificación*: Conflicto de "no tener un asiento" (lugar en la familia/sociedad), falta de apoyo fundamental.

---

## **D**

**Dedos** - Extremidades de manos y pies.
- *Biodecodificación*: Cada dedo representa diferentes conflictos (pulgar: preocupaciones; índice: autoridad; medio: sexualidad; etc.)

**Dermatitis** - Inflamación de la piel.
- *Biodecodificación*: Separación no deseada, conflicto de contacto ("no quiero que me toquen").

**Diabetes** - Alteración del metabolismo de glucosa.
- *Biodecodificación*: Resistencia a recibir amor/dulzura, necesidad de control, conflictos familiares.

**Dientes** - Estructuras para masticar.
- *Biodecodificación*: Conflictos de decisión (morder/atacar o no), agresividad no expresada.

---

## **E**

**Encías** - Tejido que rodea los dientes.
- *Biodecodificación*: Falta de decisión para "morder la vida", desvalorización en la capacidad de acción.

**Esclerosis múltiple** - Enfermedad desmielinizante del sistema nervioso.
- *Biodecodificación*: Desvalorización extrema con sensación de impotencia, rigidez emocional.

**Esófago** - Conducto que lleva comida al estómago.
- *Biodecodificación*: "No puedo tragar" algo (situación, palabras), irritación por lo que debo aceptar.

**Estómago** - Órgano de la digestión.
- *Biodecodificación*: Ira no expresada, "no puedo digerir" a alguien o algo, preocupación familiar.

**Esqueleto** - Conjunto de huesos del cuerpo.
- *Biodecodificación*: Representa la estructura de la personalidad, autoestima fundamental, apoyo.

---

## **F**

**Faringe** - Conducto muscular detrás de la boca.
- *Biodecodificación*: Miedo a no atrapar el "bocado" afectivo o material.

**Fémur** - Hueso más largo del cuerpo (muslo).
- *Biodecodificación*: Desvalorización en el movimiento ("no puedo avanzar"), conflictos con progreso.

**Fiebre** - Aumento de temperatura corporal.
- *Biodecodificación*: Ira contenida, necesidad de "quemar" una situación.

**Fístula** - Comunicación anormal entre órganos.
- *Biodecodificación*: Necesidad de mantener contacto mientras se elimina algo tóxico.

---

## **G**

**Garganta** - Zona anterior del cuello.
- *Biodecodificación*: Símbolo de la comunicación, creatividad bloqueada, palabras no dichas.

**Gastritis** - Inflamación del estómago.
- *Biodecodificación*: Ira prolongada, miedo a lo nuevo, irritación constante.

**Glándulas** - Órganos que secretan sustancias.
- *Biodecodificación*: Cada glándula tiene conflictos específicos según su función (tiroides: tiempo; suprarrenales: estrés; etc.)

---

## **H**

**Hígado** - Órgano de desintoxicación y metabolismo.
- *Biodecodificación*: Ira primaria, miedo a la carencia (alimento, dinero, amor).

**Hombros** - Articulación que une brazos al tronco.
- *Biodecodificación*: Sobrecarga emocional, responsabilidades excesivas.

**Huesos** - Estructuras rígidas del esqueleto.
- *Biodecodificación*: Desvalorización profunda, falta de autoestima esencial, conflicto de estructura.

**Hipertensión** - Presión arterial elevada.
- *Biodecodificación*: Tensión emocional prolongada, conflicto de retención (líquidos/emociones).

---

## **I**

**Insomnio** - Dificultad para dormir.
- *Biodecodificación*: Miedo, desconfianza, no poder "soltar" el control.

**Intestino delgado** - Órgano de absorción de nutrientes.
- *Biodecodificación*: Preocupación por detalles pequeños, "no puedo digerir los detalles de la vida".

**Iris** - Parte coloreada del ojo.
- *Biodecodificación*: Miedo a la luz (física o emocional), necesidad de proteger la intimidad.

---

## **J**

**Jaqueca/Migraña** - Dolor de cabeza intenso.
- *Biodecodificación*: Autocrítica severa, perfeccionismo, resistencia al flujo natural.

**Juanetes** - Deformidad del pie.
- *Biodecodificación*: Desvalorización en la dirección ("no quiero avanzar por ese camino").

**Juntas/Articulaciones** - Uniones entre huesos.
- *Biodecodificación*: Flexibilidad/rigidez ante la vida, cambios de dirección.

---

## **K**

**Keloides** - Crecimiento excesivo de cicatriz.
- *Biodecodificación*: Protección exagerada ante heridas emocionales pasadas.

**Keratosis** - Engrosamiento de la piel.
- *Biodecodificación*: Necesidad de "blindarse" emocionalmente.

---

## **L**

**Laringe** - Órgano de la voz.
- *Biodecodificación*: Miedo a expresarse, conflicto de territorio verbal.

**Ligamentos** - Tejidos que unen huesos.
- *Biodecodificación*: Conflictos de dirección y flexibilidad en decisiones.

**Lumbares** - Vértebras de la espalda baja.
- *Biodecodificación*: Desvalorización en el sostén económico/emocional, miedo a la falta de apoyo.

**Lupus** - Enfermedad autoinmune.
- *Biodecodificación*: Desvalorización extrema con sentimiento de traición, autodestrucción.

---

## **M**

**Mama/Seno** - Glándula mamaria.
- *Biodecodificación*: Conflictos del "nido" (hijos, pareja), desvalorización femenina.

**Manos** - Extremidades para agarrar.
- *Biodecodificación*: Habilidad, dar/recibir, acción en el mundo.

**Miomas** - Tumores benignos uterinos.
- *Biodecodificación*: Conflicto de frustración reproductiva/maternal.

**Músculos** - Tejidos del movimiento.
- *Biodecodificación*: Desvalorización en la acción, impotencia para actuar.

---

## **N**

**Nariz** - Órgano del olfato.
- *Biodecodificación*: "No soporto este olor" (situación/persona), irritación por lo cercano.

**Nervios** - Fibras que transmiten impulsos nerviosos.
- *Biodecodificación*: Sobrecarga informativa, comunicación bloqueada.

**Nódulos** - Pequeñas masas o bultos.
- *Biodecodificación*: Estancamiento emocional que se "solidifica".

---

## **O**

**Ojos** - Órganos de la visión.
- *Biodecodificación*: "No quiero ver" algo (presente/pasado/futuro), miedos visuales.

**Ovarios** - Glándulas reproductivas femeninas.
- *Biodecodificación*: Conflicto de pérdida (hijo, feminidad), desvalorización como mujer.

---

## **P**

**Páncreas** - Glándula digestiva y endocrina.
- *Biodecodificación*: Conflictos de "dulzura/amargura" familiar, herencia emocional.

**Piel** - Órgano más extenso del cuerpo.
- *Biodecodificación*: Protección, identidad, contacto, límites personales.

**Próstata** - Glándula masculina.
- *Biodecodificación*: Desvalorización sexual, conflicto de territorio reproductivo.

**Pulmones** - Órganos de la respiración.
- *Biodecodificación*: Miedo a la muerte, conflicto de territorio vital, tristeza.

---

## **Q**

**Quiste** - Saco con contenido líquido.
- *Biodecodificación*: Protección ante dolor emocional, recuerdo encapsulado.

---

## **R**

**Recto** - Parte final del intestino.
- *Biodecodificación*: Conflicto de identidad ("no puedo marcar mi territorio").

**Riñones** - Órganos filtradores.
- *Biodecodificación*: Miedos ancestrales, críticas, líquidos (emociones) no procesados.

**Rodillas** - Articulaciones de las piernas.
- *Biodecodificación*: Orgullo, flexibilidad, obediencia/resistencia.

---

## **S**

**Sangre** - Tejido fluido corporal.
- *Biodecodificación*: Alegría vital, familia ("la sangre"), conflictos de linaje.

**Sistema linfático** - Red de defensa inmunológica.
- *Biodecodificación*: Protección, desvalorización en la inmunidad emocional.

**Sistema nervioso** - Red de comunicación corporal.
- *Biodecodificación*: Sobrecarga de información, bloqueos en la "transmisión" emocional.

**Sinusitis** - Inflamación de senos paranasales.
- *Biodecodificación*: Irritación por alguien cercano, conflicto de "olor" emocional.

**Suprarrenales** - Glándulas del estrés.
- *Biodecodificación*: Desvalorización en la dirección, miedo al futuro.

---

## **T**

**Tendones** - Unen músculos a huesos.
- *Biodecodificación*: Tensión entre acción y resistencia.

**Timo** - Glándula inmunitaria.
- *Biodecodificación*: Miedo a la enfermedad, debilidad percibida.

**Tiroides** - Glándula del metabolismo.
- *Biodecodificación*: Impotencia, "no llego a tiempo", aceleración forzada.

**Tráquea** - Conducto de aire.
- *Biodecodificación*: Miedo en el territorio, "no puedo respirar aquí".

---

## **U**

**Uñas** - Estructuras córneas de dedos.
- *Biodecodificación*: Protección, defensa, desvalorización en la capacidad de agarrar.

**Úlcera** - Lesión en mucosa.
- *Biodecodificación*: Ira "corrosiva" no expresada.

**Útero** - Órgano reproductor femenino.
- *Biodecodificación*: Conflicto de nido, reproducción, feminidad.

**Uretra** - Conducto de eliminación urinaria.
- *Biodecodificación*: Conflictos de territorio marcado con orina (animal), límites personales.

---

## **V**

**Vejiga** - Órgano de almacenamiento urinario.
- *Biodecodificación*: Marcaje de territorio, pérdida de control, irritación por invasión.

**Venas** - Vasos que llevan sangre al corazón.
- *Biodecodificación*: Conflictos de retorno (afectivo, económico), falta de alegría en el camino.

**Vértebras** - Huesos de la columna.
- *Biodecodificación*: Cada segmento tiene conflictos específicos según su función (cervicales: dirección; dorsales: carga; lumbares: sostén).

**Vesícula biliar** - Almacena bilis.
- *Biodecodificación*: Ira, rencor, defensa agresiva del territorio.

**Vista** - Sentido de la visión.
- *Biodecodificación*: Relación con el futuro/presente/pasado según el problema visual.

---

## **X/Y/Z**

**Xerostomía** - Sequedad bucal.
- *Biodecodificación*: Miedo a atrapar el "bocado", rechazo a experiencias nuevas.

**Zumbidos (acúfenos)** - Percepción de sonidos sin fuente externa.
- *Biodecodificación*: No querer escuchar voces internas/intuición, negación de mensajes importantes.
`;

// Helper to generate a clean slug
function generateSlug(text) {
    return text.toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function run() {
    console.log("🚀 Iniciando expansión del diccionario SanArte...");

    const entries = [];
    const lines = RAW_DATA.split('\n');

    let currentEntry = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines or section headers but process meaningful ones
        if (!trimmed || trimmed.startsWith('## **') || trimmed === '---') continue;

        // Match "**Name** - Definition"
        // Regex adjustment: Catch potential spaces inside **
        const definitionMatch = trimmed.match(/^\*\*(.+?)\*\*\s*-\s*(.+)/);

        // Match "- *Biodecodificación*: Meaning"
        const bioMatch = trimmed.match(/^-\s*\*(?:Biodecodificación|Biodescodificación)\*:\s*(.+)/i);

        if (definitionMatch) {
            // Save previous if exists
            if (currentEntry) entries.push(currentEntry);

            // Start new
            const name = definitionMatch[1].trim();
            const definition = definitionMatch[2].trim();

            console.log(`📌 Encontrado: ${name}`);

            currentEntry = {
                slug: generateSlug(name),
                name: name,
                content: {
                    name: name,
                    shortDefinition: definition,
                    emotionalAnalysis: "", // Will fill next
                    // Default / Generic Fields to keep structure valid
                    sideSymbolism: "El lado afecta la interpretación (Derecho: Padre/Acción, Izquierdo: Madre/Emoción).",
                    conflictList: [],
                    internalMonologue: "Me escucho, me acepto y me perdono.",
                    questionsForSoul: ["¿Qué situación no estoy logrando gestionar?", "¿Qué necesito expresar?"],
                    physicalAdvice: ["Respiración consciente.", "Hidratación."],
                    naturalRemedies: "Infusiones relajantes (Manzanilla, Tilo).",
                    aromatherapy: [{ name: "Lavanda", benefit: "Relajación general." }],
                    archangel: "Arcángel Rafael (Verde): Sanación.",
                    holisticTherapies: "Meditación, Reiki.",
                    meditationScript: "Visualiza luz verde sanadora recorriendo esta zona.",
                    affirmations: ["Estoy a salvo.", "Mi cuerpo es sabio."],
                    finalMessage: "Tu cuerpo busca equilibrio. Escúchalo con amor."
                }
            };
        } else if (bioMatch && currentEntry) {
            currentEntry.content.emotionalAnalysis = bioMatch[1].trim();
            // Try to extract conflict from analysis if possible, or just leave generic
            currentEntry.content.conflictList.push({
                conflict: "Conflicto Emocional Principal",
                manifestation: bioMatch[1].trim()
            });
        }
    }

    // Push last entry
    if (currentEntry) entries.push(currentEntry);

    console.log(`\n📋 Procesando ${entries.length} entradas...`);

    // Insert into Supabase
    let successCount = 0;
    let errorCount = 0;

    for (const entry of entries) {
        const { error } = await supabase
            .from('symptom_catalog')
            .upsert({
                slug: entry.slug,
                name: entry.name,
                content: entry.content
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error al insertar ${entry.name}:`, error.message);
            errorCount++;
        } else {
            // console.log(`✅ Guardado: ${entry.name}`);
            successCount++;
        }
    }

    console.log(`\n✨ Finalizado!`);
    console.log(`✅ Éxitos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
}

run();
