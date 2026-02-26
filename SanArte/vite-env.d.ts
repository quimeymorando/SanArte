/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_LS_CHECKOUT_MONTHLY?: string
    readonly VITE_LS_CHECKOUT_ANNUAL?: string
    readonly VITE_LS_CHECKOUT_MECENAS?: string
    readonly VITE_ADSENSE_SLOT_DASHBOARD_BANNER?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
