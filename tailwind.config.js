/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#00f2ff", // Cyan Neón
                "primary-hover": "#00d1db",
                "secondary": "#7000ff", // Violeta Profundo
                "accent": "#ff00d4", // Magenta Glow
                "gold": "#d4af37",
                "gold-light": "#f9e295",
                "futuro-deep": "#050b0d", // Fondo ultra oscuro
                "futuro-surface": "rgba(15, 32, 39, 0.7)", // Glassmorphism layer
                "background-light": "#f0f4f5",
                "background-dark": "#050b0d",
                "surface-light": "#fcfdfe",
                "surface-dark": "#0f1e24",
                "text-main": "#e2e8f0",
                "text-sub": "#94a3b8",
            },
            fontFamily: {
                "display": ["Outfit", "Inter", "sans-serif"],
                "heading": ["Poppins", "sans-serif"],
                "sans": ["Inter", "sans-serif"],
            },
            borderRadius: { "DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px" },
            boxShadow: {
                'glow-primary': '0 0 15px rgba(0, 242, 255, 0.3)',
                'glow-accent': '0 0 15px rgba(255, 0, 212, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 8s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite linear',
                'breathing': 'breathing 4s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                breathing: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 242, 255, 0.6)' },
                }
            }
        },
    },
    plugins: [],
}
