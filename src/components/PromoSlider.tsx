'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import CatalogModal from './CatalogModal'

interface Promotion {
    id: number
    image: string
}

const promotions: Promotion[] = [
    {
        id: 1,
        image: '/assets/sales/Main banner.png',
    },
    {
        id: 2,
        image: '/assets/sales/Main banner.png',
    },
]

const PromoSlider = () => {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [subcategories, setSubcategories] = useState<string[]>([])

    useEffect(() => {
        fetch('http://api:8080/catalog.php')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || [])
                setSubcategories(data.subcategories || [])
            })
    }, [])

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-lg overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                speed={800}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 5000 }}
                pagination={{ clickable: true }}
                navigation
                className="w-full h-full"
            >
                {promotions.map((promo) => (
                    <SwiperSlide key={promo.id}>
                        <div
                            onClick={() => setOpen(true)}
                            className="w-full h-full cursor-pointer"
                        >
                            <img
                                src={promo.image}
                                alt=""
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <CatalogModal
                open={open}
                setOpen={setOpen}
                categories={categories}
                subcategories={subcategories}
            />

            <style jsx global>{`
                .swiper-pagination-bullet {
                    background-color: #ccc;
                    opacity: 1;
                }
                .swiper-pagination-bullet-active {
                    background-color: #facc15;
                }
                .swiper-button-next,
                .swiper-button-prev {
                    color: black;
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                }
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 16px;
                }
            `}</style>
        </div>
    )
}

export default PromoSlider
