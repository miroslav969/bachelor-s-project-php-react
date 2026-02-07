'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

interface User {
    name: string
    surname: string
    email: string
    password: string
    phone: string
}

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
        repeatPassword: "",
        phone: "+371"
    })
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (form.password !== form.repeatPassword) {
            setError("Пароли не совпадают")
            return
        }

        if (!form.email.includes("@")) {
            setError("Некорректный email")
            return
        }

        const user: User = {
            name: form.name,
            surname: form.surname,
            email: form.email,
            password: form.password,
            phone: form.phone
        }

        localStorage.setItem("user", JSON.stringify(user))
        router.push("/profile")
    }

    return (
        <div className="max-w-xl mx-auto p-8 min-h-[100vh]">
            <h1 className="text-2xl font-bold text-center mb-10">Регистрация</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 font-medium text-center">{error}</p>}

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">Имя</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-2xl outline-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">Фамилия</label>
                    <input
                        name="surname"
                        value={form.surname}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-2xl outline-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">E-mail</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-2xl outline-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">Пароль</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-2xl outline-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">Повторите пароль</label>
                    <input
                        name="repeatPassword"
                        type="password"
                        value={form.repeatPassword}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-2xl outline-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold ml-4">Телефон</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+371</span>
                        <input
                            name="phone"
                            value={form.phone.replace('+371', '')}
                            onChange={(e) => setForm({ ...form, phone: `+371${e.target.value}` })}
                            className="w-full pl-16 p-3 border rounded-2xl outline-blue-500"
                        />
                    </div>
                </div>


                <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-gray-900 transition"
                >
                    Зарегистрироваться
                </button>
            </form>
        </div>
    )
}
