'use client'

import { Dispatch, SetStateAction } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export default function CategoryFilterModal({ open, setOpen }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                >
                    <div className="flex justify-end">
                        <button onClick={() => setOpen(false)} className="p-2">
                            <X size={24} />
                        </button>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Фильтры</h2>

                    {/* Фильтры */}
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold">Производитель</p>
                            <label><input type="checkbox" /> Acer</label><br />
                            <label><input type="checkbox" /> Asus</label><br />
                            <label><input type="checkbox" /> MSI</label>
                        </div>
                        {/* Добавить другие фильтры по макету */}
                    </div>

                    <button className="mt-8 bg-yellow-400 text-black font-semibold py-2 px-6 rounded hover:bg-yellow-500">
                        Применить
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
