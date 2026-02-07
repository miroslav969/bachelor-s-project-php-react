'use client'

import { useEffect, useRef, useState } from 'react'
import { products } from '@/lib/products'
import Link from 'next/link'
import Image from 'next/image'

export default function SearchBar() {
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState([])
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (search.length > 1) {
            const results = products.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            )
            setFiltered(results)
            setOpen(true)
        } else {
            setFiltered([])
            setOpen(false)
        }
    }, [search])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            <input
                type="text"
                placeholder="Поиск по сайту"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setOpen(true)}
                className="w-full h-[32px] px-5 py-3 rounded-full bg-[#f59ca3] placeholder-black text-black outline-none"
            />

            {open && filtered.length > 0 && (
                <div className="absolute z-50 bg-white shadow-md rounded-lg mt-2 p-4 w-full">
                    <p className="text-black font-semibold mb-2">Результаты</p>
                    <ul className="space-y-2">
                        {filtered.map((item) => (
                            <li key={item.sku}>
                                <Link
                                    href={`/product/${item.sku}`}
                                    className="flex items-center gap-4 hover:underline"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={40}
                                        height={40}
                                        className="rounded"
                                    />
                                    <span className="text-black text-sm">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
