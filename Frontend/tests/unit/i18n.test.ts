import { describe, expect, it } from 'vitest'
import { translations } from '@/lib/i18n'

describe('translations', () => {
    it('contains expected locales', () => {
        expect(Object.keys(translations).sort()).toEqual(['en', 'lv', 'ru'])
    })

    it('contains required keys for each locale', () => {
        const keys = ['catalog', 'search', 'cart', 'wishlist', 'profile']

        for (const locale of Object.keys(translations) as Array<keyof typeof translations>) {
            for (const key of keys) {
                expect(translations[locale][key as keyof (typeof translations)[typeof locale]]).toBeTruthy()
            }
        }
    })
})
