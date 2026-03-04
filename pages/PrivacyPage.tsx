
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[2rem] shadow-xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-primary font-bold hover:underline"
                >
                    <span className="material-symbols-outlined">arrow_back</span> Volver
                </button>

                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Política de Privacidad</h1>

                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
                    <p>
                        En SanArte, valoramos y respetamos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal y de salud.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">1. Información que Recopilamos</h3>
                    <p>
                        Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico y los síntomas que buscas o registras en tu diario personal.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">2. Uso de Inteligencia Artificial</h3>
                    <p>
                        Utilizamos tecnologías de Inteligencia Artificial (Gemini) para interpretar consultas de síntomas. Las consultas enviadas a la IA son anónimas y no se utilizan para entrenar modelos públicos con tus datos personales.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">3. Almacenamiento de Datos</h3>
                    <p>
                        Tus datos se almacenan de forma segura en nuestros servidores (Supabase). Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">4. Tus Derechos</h3>
                    <p>
                        Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Puedes solicitar la eliminación de tu cuenta desde la sección de Perfil.
                    </p>

                    <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-sm">
                            Si tienes preguntas sobre esta política, contáctanos en <a href="mailto:hola@sanarte.app" className="text-primary font-bold hover:underline">hola@sanarte.app</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
