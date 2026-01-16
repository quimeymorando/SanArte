import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-6 text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4 animate-bounce">error_medication</span>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Algo salió mal</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                        Nuestro sistema sanador tuvo un pequeño tropiezo. Por favor intenta recargar.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Recargar Página
                    </button>

                    {/* Technical Details (Hidden by default or small) */}
                    <details className="mt-8 text-left max-w-lg w-full bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                        <summary className="text-xs font-bold text-red-400 cursor-pointer">Detalles Técnicos</summary>
                        <pre className="mt-2 text-[10px] text-red-800 dark:text-red-200 overflow-auto whitespace-pre-wrap font-mono">
                            {this.state.error?.toString()}
                            <br />
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
