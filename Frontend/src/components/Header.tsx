'use client'

import { useState, useEffect } from 'react'
import CatalogModal from './CatalogModal'
import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import {router} from "next/client";
import {useRouter} from "next/navigation";
import SearchBar from "@/components/SearchBar";
import {Locale, translations} from "@/lib/i18n";
import {useLang} from "@/lib/context/LangContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCart } from '@/lib/context/CartContext'

export default function Header() {
    const [catalogOpen, setCatalogOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [subcategories, setSubcategories] = useState<string[]>([])
    const [search, setSearch] = useState('')
    const router = useRouter()
    const { lang, setLang } = useLang()
    const t = translations[lang]
    const { cart, total } = useCart()
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        fetch('http://api:8080/catalog.php')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories)
                setSubcategories(data.subcategories)
            })
    }, [])

    return (
        <>
            <header className="bg-red-500 text-white p-4 flex items-center justify-evenly  relative">
                {/* Лого и язык */}
                <div className="flex items-center gap-4">
                    <div onClick={() => router.push("/")} className="size-16 cursor-pointer sm:size-40 bg-[url(/assets/icon.png)] bg-contain bg-no-repeat" />
                    <LanguageSwitcher />
                    <button
                        onClick={() => setCatalogOpen(true)}
                        className="flex items-center gap-2 bg-black text-sm text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    ><svg width="20" className="w-5 h-5" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5H1M19 1H1M19 9H1M19 13H1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                        <span className="px-4">КАТАЛОГ</span>
                    </button>
                </div>

                {/* Поиск */}
                <div className="flex-1 max-w-xs sm:max-w-xl mx-4 bg-[#f59ca3] rounded-full items-center px-5 py-2 sm:py-3 hidden sm:flex">
                    <SearchBar/>
                    <button className="text-black">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                {/* Иконки */}
                <div className="hidden sm:flex items-center gap-3 cursor-pointer">
                    <Link href="/wishlist" className="bg-[#f59ca3] p-3 rounded-full text-black hover:opacity-80">
                        <img src="/heart.svg" alt="Избранное" />
                    </Link>
                    <Link href="/profile" className="bg-[#f59ca3] p-3 rounded-full text-black hover:opacity-80">
                        <img src="/user.svg" alt="Пользователь cursor-pointer" />
                    </Link>
                    <Link href="/cart" className="flex items-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded-[16px] text-sm hover:opacity-90">
                        <img src="/cart.svg" alt="Корзина" />
                        <span className="hidden sm:inline">
                          {itemCount > 0 ? `Товаров: ${itemCount}` : 'Ваша корзина пуста'}
                        </span>
                    </Link>
                </div>

                {/* Бургер */}
                <button
                    className="sm:hidden p-2 bg-white rounded text-black"
                    onClick={() => setMenuOpen(true)}
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* Мобильное меню */}
            {menuOpen && (
                <div className="sm:hidden fixed inset-0 bg-black/50 z-50 flex justify-end">
                    <div className="bg-white w-[75%] h-full p-4 text-black relative">
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="absolute top-4 right-4 text-black"
                        >
                            <X size={24} />
                        </button>

                        <nav className="mt-12 flex flex-col gap-4">
                            <Link href="/wishlist" className="text-lg font-medium">Избранное</Link>
                            <Link href="/profile" className="text-lg font-medium">Профиль</Link>
                            <Link href="/cart" className="text-lg font-medium">Корзина</Link>
                        </nav>
                    </div>
                </div>
            )}

            <CatalogModal
                open={catalogOpen}
                setOpen={setCatalogOpen}
                categories={categories}
                subcategories={subcategories}
            />
        </>
    )
}
