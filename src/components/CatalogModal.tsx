'use client'
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import Link from 'next/link'

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    categories: string[];
    subcategories: string[];
}

export default function CatalogModal({ open, setOpen, categories, subcategories }: Props) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    useEffect(() => {
        if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0])
        }
    }, [categories])
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50"
                >
                    {/* Затемнение */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black"
                        onClick={() => setOpen(false)}
                    />

                    {/* Модальное окно */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-1/2 w-[90%] md:w-[700px] max-w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl"
                    >
                        <div className="flex justify-center text-center items-center mb-4">
                            <h2 className="text-2xl font-bold">Каталог</h2>
                            <button className="align-bottom" onClick={() => setOpen(false)}>
                                <X className="w-6 h-6 top-2 right-2 absolute cursor-pointer" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="space-y-3 md:space-y-1">
                                <button
                                    onClick={() => setActiveCategory("tv-video")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" height="24" className="w-[24px] col-span-2 sm:col-span-1" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 19H15M11 15V19M3 1H19C20.1046 1 21 1.89543 21 3V13C21 14.1046 20.1046 15 19 15H3C1.89543 15 1 14.1046 1 13V3C1 1.89543 1.89543 1 3 1Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="col-span-8 sm:col-span-9">ТВ и Видео</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("audio")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" height="24" className="w-[24px] col-span-2 sm:col-span-1" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5H9.01M3 1H15C16.1046 1 17 1.89543 17 3V19C17 20.1046 16.1046 21 15 21H3C1.89543 21 1 20.1046 1 19V3C1 1.89543 1.89543 1 3 1ZM13 13C13 15.2091 11.2091 17 9 17C6.79086 17 5 15.2091 5 13C5 10.7909 6.79086 9 9 9C11.2091 9 13 10.7909 13 13Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>

                                    <span className="col-span-8 sm:col-span-9">Аудио</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("photo")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" height="24" className="w-[24px] col-span-2 sm:col-span-1" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23 17C23 17.5304 22.7893 18.0391 22.4142 18.4142C22.0391 18.7893 21.5304 19 21 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H7L9 1H15L17 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V17Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>

                                    <span className="col-span-8 sm:col-span-9">Фото</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("smartphones")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" height="24" className="w-[24px] col-span-2 sm:col-span-1" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 17H8.01M3 1H13C14.1046 1 15 1.89543 15 3V19C15 20.1046 14.1046 21 13 21H3C1.89543 21 1 20.1046 1 19V3C1 1.89543 1.89543 1 3 1Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>

                                    <span className="col-span-8 sm:col-span-9">Телефоны и смарт-часы</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("apple")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" className="w-[24px] col-span-2 sm:col-span-1" height="24" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.177 4.17684C11.094 5.26084 9.037 4.96184 9.037 4.96184C9.037 4.96184 8.739 2.90584 9.823 1.82184C10.906 0.738839 12.963 1.03784 12.963 1.03784C12.963 1.03784 13.261 3.09284 12.177 4.17684ZM1 13.0598C1 16.3408 3.196 20.1098 5.419 20.9068C6.189 21.1828 6.986 20.8018 7.648 20.3268C8.15 19.9668 8.758 19.6238 9.25 19.6238C9.74 19.6238 10.35 19.9668 10.851 20.3268C11.513 20.8018 12.31 21.1828 13.081 20.9068C14.66 20.3408 16.226 18.2738 17 15.9468C15.5 15.5168 14.406 14.1608 14.406 12.5538C14.406 11.0818 15.325 9.81984 16.632 9.28884C15.79 7.79284 14.414 6.99984 12.859 6.99984C12.055 6.99984 11.315 7.32384 10.719 7.71284C9.765 8.33284 8.734 8.33284 7.781 7.71284C7.184 7.32384 6.445 6.99984 5.641 6.99984C3.077 6.99984 1 9.15484 1 13.0598Z" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="col-span-8 sm:col-span-9">Продукция Apple</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("consoles")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" height="24" className="w-[24px] col-span-2 sm:col-span-1" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.44017 12.5008C3.13624 12.5012 2.8336 12.4612 2.54017 12.382C1.65949 12.1309 0.912316 11.5446 0.458961 10.7489C0.00560653 9.95315 -0.117817 9.01145 0.115171 8.12579L1.57142 2.60079C1.68483 2.15365 1.88645 1.73367 2.16443 1.36554C2.44241 0.997398 2.79115 0.688518 3.19017 0.457038C3.57869 0.232007 4.008 0.0863042 4.45323 0.0283708C4.89845 -0.0295626 5.35075 0.00142483 5.78392 0.119538C6.24438 0.247406 6.67326 0.469542 7.04337 0.771865C7.41347 1.07419 7.71673 1.45011 7.93392 1.87579H9.55892C9.77548 1.44965 10.0785 1.07337 10.4487 0.770968C10.8189 0.468568 11.2481 0.246701 11.7089 0.119538C12.1421 0.00142483 12.5944 -0.0295626 13.0396 0.0283708C13.4848 0.0863042 13.9142 0.232007 14.3027 0.457038C14.6997 0.687926 15.0472 0.995111 15.325 1.36089C15.6029 1.72667 15.8055 2.14382 15.9214 2.58829L17.3777 8.12579C17.6141 9.01403 17.4917 9.95965 17.0368 10.7584C16.5819 11.5571 15.831 12.1448 14.9464 12.3945C14.5133 12.5127 14.061 12.5436 13.6157 12.4857C13.1705 12.4278 12.7412 12.2821 12.3527 12.057C11.9549 11.827 11.607 11.52 11.3291 11.1541C11.0511 10.7882 10.8488 10.3707 10.7339 9.92579L10.6214 9.37579H6.87142L6.72767 9.91329C6.61276 10.3582 6.41045 10.7757 6.13253 11.1416C5.85462 11.5075 5.50665 11.8145 5.10892 12.0445C4.6011 12.3374 4.02638 12.4946 3.44017 12.5008ZM4.89017 1.25079C4.51305 1.25235 4.14273 1.35139 3.81517 1.53829C3.30195 1.8394 2.92891 2.33155 2.77767 2.90704L1.32142 8.43204C1.16904 9.00125 1.24604 9.60753 1.53587 10.1206C1.8257 10.6336 2.30524 11.0125 2.87142 11.1758C3.14486 11.2504 3.43038 11.27 3.71145 11.2335C3.99253 11.197 4.26358 11.1052 4.50892 10.9633C4.76436 10.8158 4.98773 10.6188 5.16591 10.3837C5.34408 10.1486 5.47345 9.88032 5.54642 9.59454L5.93392 8.12579H11.5589L11.9402 9.59454C12.0144 9.87978 12.1443 10.1475 12.3224 10.3824C12.5004 10.6173 12.7231 10.8147 12.9777 10.9633C13.2242 11.1051 13.4963 11.1968 13.7784 11.2333C14.0604 11.2697 14.3469 11.2502 14.6214 11.1758C15.1883 11.014 15.6684 10.6351 15.9575 10.1213C16.2465 9.60759 16.3212 9.00051 16.1652 8.43204L14.7089 2.90704C14.6364 2.62191 14.5078 2.35406 14.3308 2.11908C14.1537 1.88409 13.9317 1.68667 13.6777 1.53829C13.4311 1.39652 13.159 1.30477 12.877 1.26831C12.5949 1.23184 12.3084 1.25138 12.0339 1.32579C11.6945 1.42256 11.383 1.59892 11.1253 1.84024C10.8677 2.08156 10.6714 2.38086 10.5527 2.71329L10.4027 3.12579H7.09017L6.94017 2.71329C6.82039 2.38042 6.62296 2.0809 6.36426 1.8396C6.10557 1.59829 5.79306 1.42215 5.45267 1.32579C5.26922 1.27647 5.08013 1.25126 4.89017 1.25079Z" fill="black"/>
                                        <path d="M4.99642 6.25079C4.74919 6.25079 4.50752 6.17748 4.30196 6.04013C4.0964 5.90277 3.93618 5.70755 3.84157 5.47914C3.74696 5.25073 3.72221 4.9994 3.77044 4.75693C3.81867 4.51445 3.93772 4.29172 4.11254 4.11691C4.28735 3.94209 4.51008 3.82304 4.75256 3.77481C4.99503 3.72658 5.24637 3.75133 5.47477 3.84594C5.70318 3.94055 5.89841 4.10076 6.03576 4.30633C6.17311 4.51189 6.24642 4.75356 6.24642 5.00079C6.24642 5.33231 6.11472 5.65025 5.8803 5.88467C5.64588 6.11909 5.32794 6.25079 4.99642 6.25079Z" fill="black"/>
                                        <path d="M12.4964 4.37579C12.8416 4.37579 13.1214 4.09597 13.1214 3.75079C13.1214 3.40561 12.8416 3.12579 12.4964 3.12579C12.1512 3.12579 11.8714 3.40561 11.8714 3.75079C11.8714 4.09597 12.1512 4.37579 12.4964 4.37579Z" fill="black"/>
                                        <path d="M12.4964 6.87579C12.8416 6.87579 13.1214 6.59597 13.1214 6.25079C13.1214 5.90561 12.8416 5.62579 12.4964 5.62579C12.1512 5.62579 11.8714 5.90561 11.8714 6.25079C11.8714 6.59597 12.1512 6.87579 12.4964 6.87579Z" fill="black"/>
                                        <path d="M11.2464 5.62579C11.5916 5.62579 11.8714 5.34597 11.8714 5.00079C11.8714 4.65561 11.5916 4.37579 11.2464 4.37579C10.9012 4.37579 10.6214 4.65561 10.6214 5.00079C10.6214 5.34597 10.9012 5.62579 11.2464 5.62579Z" fill="black"/>
                                        <path d="M13.7464 5.62579C14.0916 5.62579 14.3714 5.34597 14.3714 5.00079C14.3714 4.65561 14.0916 4.37579 13.7464 4.37579C13.4012 4.37579 13.1214 4.65561 13.1214 5.00079C13.1214 5.34597 13.4012 5.62579 13.7464 5.62579Z" fill="black"/>
                                    </svg>

                                    <span className="col-span-8 sm:col-span-9">Игры и игровые консоли</span>
                                </button>
                                <button
                                    onClick={() => setActiveCategory("accessories")}
                                    className="font-semibold custom-link display-icon grid grid-cols-10 w-full text-left"
                                >
                                    <svg width="24" className="w-[24px] col-span-2 sm:col-span-1" height="24" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 13H3C2.46957 13 1.96086 12.7893 1.58579 12.4142C1.21071 12.0391 1 11.5304 1 11V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H6.19M15 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V11C19 11.5304 18.7893 12.0391 18.4142 12.4142C18.0391 12.7893 17.5304 13 17 13H13.81M23 8V6M11 1L7 7H13L9 13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="col-span-8 sm:col-span-9">Батарейки и провода</span>
                                </button>
                            </div>
                            <div className="space-y-2 text-sm md:space-y-1">
                                {activeCategory === 'tv-video' && (
                                    <>
                                        <Link href="/category/tv-video/televisions" className="font-semibold block hover:text-red-500">Телевизоры</Link>
                                        <Link href="/category/tv-video/projectors" className="font-semibold block hover:text-red-500">Проекторы</Link>
                                        <Link href="/category/tv-video/media-players" className="font-semibold block hover:text-red-500">Медиаплееры</Link>
                                    </>
                                )}

                                {activeCategory === 'audio' && (
                                    <>
                                        <Link href="/category/audio/headphones" className="font-semibold block hover:text-red-500">Наушники</Link>
                                        <Link href="/category/audio/speakers" className="font-semibold block hover:text-red-500">Колонки</Link>
                                        <Link href="/category/audio/soundbars" className="font-semibold block hover:text-red-500">Саундбары</Link>
                                    </>
                                )}

                                {activeCategory === 'photo' && (
                                    <>
                                        <Link href="/category/photo/cameras" className="font-semibold block hover:text-red-500">Фотоаппараты</Link>
                                        <Link href="/category/photo/lenses" className="font-semibold block hover:text-red-500">Объективы</Link>
                                        <Link href="/category/photo/accessories" className="font-semibold block hover:text-red-500">Аксессуары</Link>
                                    </>
                                )}

                                {activeCategory === 'smartphones' && (
                                    <>
                                        <Link href="/category/smartphones/phones" className="font-semibold block hover:text-red-500">Смартфоны</Link>
                                        <Link href="/category/smartphones/watches" className="font-semibold block hover:text-red-500">Смарт-часы</Link>
                                        <Link href="/category/smartphones/accessories" className="font-semibold block hover:text-red-500">Аксессуары</Link>
                                    </>
                                )}

                                {activeCategory === 'apple' && (
                                    <>
                                        <Link href="/category/apple/iphone" className="font-semibold block hover:text-red-500">iPhone</Link>
                                        <Link href="/category/apple/macbook" className="font-semibold block hover:text-red-500">MacBook</Link>
                                        <Link href="/category/apple/ipad" className="font-semibold block hover:text-red-500">iPad</Link>
                                    </>
                                )}

                                {activeCategory === 'consoles' && (
                                    <>
                                        <Link href="/category/consoles/playstation" className="font-semibold block hover:text-red-500">Игры для PlayStation</Link>
                                        <Link href="/category/consoles/xbox" className="font-semibold block hover:text-red-500">Игры для Xbox</Link>
                                        <Link href="/category/consoles/nintendo" className="font-semibold block hover:text-red-500">Игры для Nintendo</Link>
                                    </>
                                )}

                                {activeCategory === 'accessories' && (
                                    <>
                                        <Link href="/category/accessories/batteries" className="font-semibold block hover:text-red-500">Батарейки</Link>
                                        <Link href="/category/accessories/cables" className="font-semibold block hover:text-red-500">Кабели</Link>
                                        <Link href="/category/accessories/chargers" className="font-semibold block hover:text-red-500">Зарядки</Link>
                                    </>
                                )}

                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
