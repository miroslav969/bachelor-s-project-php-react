'use client'

import { useState } from 'react'
import { useLang } from '@/lib/context/LangContext'

export default function LanguageSwitcher() {
    const { lang, setLang } = useLang()
    const [open, setOpen] = useState(false)

    const languages = [
        { code: 'ru', label: '🇷🇺 RU' },
        { code: 'en', label: '🇬🇧 EN' },
        { code: 'lv', label: '🇱🇻 LV' },
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-black hover:underline"
            >
                {languages.find(l => l.code === lang)?.label}
                <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-24 bg-white text-black border border-black rounded shadow-md">
                    {languages.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => {
                                setLang(l.code as any)
                                setOpen(false)
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-red-500 rounded ${
                                l.code === lang ? 'bg-red-500 font-bold' : ''
                            }`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
