'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {Product} from "@/lib/products";
import { toast } from 'sonner'
import {useCart} from "@/lib/context/CartContext";
import {useWishlist} from "@/lib/context/WishlistContext";
import {Heart} from "lucide-react";

export default function ProductCard({ name, price, oldPrice, image, sku, specs }: Product) {
    const shortSpec = specs ? Object.values(specs)[0]?.[0]?.split(':')[1]?.trim() : '';
    const { add } = useCart();
    const { toggle, isInWishlist } = useWishlist()
    const inWishlist = isInWishlist(sku) // sku должен быть строкой
    return (
        <Link href={`/product/${sku}`} className="block">
            <div className="relative flex-shrink-0 p-4 w-[320px] border rounded-lg hover:shadow-lg transition-shadow">
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        toggle(sku)
                    }}
                    className="absolute cursor-pointer top-6 right-6 bg-white rounded-full p-2 shadow z-20"
                >
                    {inWishlist ? (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    ) : (
                        <Heart className="w-5 h-5 text-gray-500" />
                    )}
                </button>
                {oldPrice && (
                    <div className="absolute content-center h-[48px] align-middle bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-[48px] w-[48px] z-10">
                        Акция
                    </div>
                )}

                <div className="rounded-md h-[375px] bg-[#c4c4c4]">
                    <Image
                        src={image}
                        alt={name}
                        width={320}
                        height={375}
                        loading="lazy"
                        className="object-contain h-full"
                        placeholder="blur"
                        blurDataURL="/placeholder-image.jpg"
                    />
                </div>

                <h3 className="font-semibold text-2xl mt-2 line-clamp-1">{name}</h3>

                <div className="grid grid-cols-2 mt-2">
                    <p className="text-sm text-gray-500 mb-2">{sku}</p>
                    {shortSpec && <p className="text-sm text-gray-600">{shortSpec}</p>}
                </div>


                <div className="mt-2 grid grid-cols-2 align-center">
                    <div>
                        {oldPrice && (
                            <span className="line-through text-gray-400 mr-2">€{oldPrice}</span>
                        )}
                        <span className="text-black font-bold text-xl">€{price}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            add(sku)
                            toast.success(`${name} добавлен в корзину`)
                        }}
                        className="bg-yellow-400 cursor-pointer hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </Link>
    )
}
