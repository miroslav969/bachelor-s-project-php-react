'use client'
import React from "react";

export default function ProductSection() {
    return (
        <section className="p-4 bg-white">
            <h2 className="text-xl font-bold mb-4 text-black">Возможно, вам понравится</h2>
            <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 text-black">
            </div>
        </section>
    );
}
