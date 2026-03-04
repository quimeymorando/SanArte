
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
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

                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Términos de Servicio</h1>

                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-700">
                        <h3 className="text-lg font-black text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined">warning</span>
                            Descargo de Responsabilidad Médica
                        </h3>
                        <p className="text-sm font-medium text-amber-900/80 dark:text-amber-200/80">
                            SanArte es una herramienta de bienestar espiritual y autoconocimiento. <strong>NO sustituye el consejo, diagnóstico o tratamiento médico profesional.</strong> Nunca ignores el consejo médico profesional ni demores en buscarlo debido a algo que hayas leído en esta aplicación.
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">1. Aceptación de los Términos</h3>
                    <p>
                        Al acceder y utilizar SanArte, aceptas cumplir con estos Términos de Servicio y todas las leyes aplicables. Si no estás de acuerdo, no utilices la aplicación.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">2. Uso Apropiado</h3>
                    <p>
                        Te comprometes a utilizar la aplicación solo para fines legales y de bienestar personal. No toleramos contenido ofensivo, dañino o discriminatorio en nuestras áreas de comunidad.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">3. Propiedad Intelectual</h3>
                    <p>
                        Todo el contenido, diseño y funcionalidad de SanArte son propiedad exclusiva de SanArte y están protegidos por las leyes de derechos de autor internacionales.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">4. Cuentas Premium</h3>
                    <p>
                        Las suscripciones Premium ofrecen acceso a contenido exclusivo. Nos reservamos el derecho de modificar precios y características con previo aviso.
                    </p>

                    <div className="mt-12 border-t pt-8 border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-400">
                            Última actualización: Enero 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
