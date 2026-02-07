'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
    open: boolean
    setOpen: (v: boolean) => void
}

export default function FilterModal({ open, setOpen }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setOpen(false)}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-lg p-6 w-[90%] max-w-md z-10"
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Фильтры</h2>

                        {/* Примерные блоки фильтра */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Цена</label>
                            <div className="flex gap-2">
                                <input type="number" placeholder="от" className="input" />
                                <input type="number" placeholder="до" className="input" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Производитель</label>
                            <select className="input w-full">
                                <option>Любой</option>
                                <option>Apple</option>
                                <option>Asus</option>
                                <option>Lenovo</option>
                            </select>
                        </div>

                        <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded">
                            Применить
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
