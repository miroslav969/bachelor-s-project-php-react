export const translations = {
    ru: {
        catalog: 'Каталог',
        search: 'Поиск по сайту',
        cart: 'Ваша корзина',
        wishlist: 'Избранное',
        profile: 'Профиль',
    },
    en: {
        catalog: 'Catalog',
        search: 'Search the site',
        cart: 'Your cart',
        wishlist: 'Wishlist',
        profile: 'Profile',
    },
    lv: {
        catalog: 'Katalogs',
        search: 'Meklēt vietnē',
        cart: 'Jūsu grozs',
        wishlist: 'Vēlmju saraksts',
        profile: 'Profils',
    },
}

export type Locale = keyof typeof translations
