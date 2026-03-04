import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ErrorContextType {
    error: string | null;
    showError: (message: string) => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const GlobalErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [error, setError] = useState<string | null>(null);

    const showError = useCallback((message: string) => {
        console.error("Global Error Caught:", message);
        setError(message);
        // Auto-clear after 5 seconds
        setTimeout(() => setError(null), 5000);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <ErrorContext.Provider value={{ error, showError, clearError }}>
            {children}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-in-top">
                    <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-red-400">
                        <span className="material-symbols-outlined">warning</span>
                        <span className="font-medium text-sm">{error}</span>
                        <button onClick={clearError} className="ml-2 hover:bg-white/20 rounded-full p-1">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>
            )}
        </ErrorContext.Provider>
    );
};

export const useGlobalError = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useGlobalError must be used within a GlobalErrorProvider');
    }
    return context;
};
