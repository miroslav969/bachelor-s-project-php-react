'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Locale = 'ru' | 'en' | 'lv'

const LangContext = createContext<{
    lang: Locale
    setLang: (l: Locale) => void
}>({ lang: 'ru', setLang: () => {} })

export const useLang = () => useContext(LangContext)

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Locale>('ru')

    useEffect(() => {
        const stored = localStorage.getItem('lang') as Locale
        if (stored) setLang(stored)
    }, [])

    useEffect(() => {
        localStorage.setItem('lang', lang)
    }, [lang])

    return (
        <LangContext.Provider value={{ lang, setLang }}>
            {children}
        </LangContext.Provider>
    )
}
