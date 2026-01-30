'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    name: string
    surname: string
    email: string
    password: string
    phone: string
    address?: string
    city?: string
    postal?: string
}

export default function ProfileClient() {
    const [user, setUser] = useState<User | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [edited, setEdited] = useState<Partial<User>>({})
    const [editedPhone, setEditedPhone] = useState('')
    const router = useRouter()

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                setUser(null)
            }
        } else {
            router.push('/register')
        }
    }, [router])

    const handleDeleteAccount = () => {
        localStorage.removeItem('user')
        router.push('/register')
    }

    const handleClearPhone = () => {
        if (!user) return
        const updatedUser = { ...user, phone: '' }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setEditedPhone('')
    }

    const handleDeleteAddress = () => {
        if (!user) return
        const updated = { ...user }
        delete updated.address
        delete updated.city
        delete updated.postal
        const updatedUser = {
            ...user,
            phone: `+371 ${editedPhone.trim()}`
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
    }

    const handleSave = () => {
        if (!user) return
        const updated = { ...user, ...edited }
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
        setIsEditing(false)
    }

    if (!user) return null

    return (
        <div className="max-w-5xl mx-auto p-10 min-h-[100vh]">
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">Мой профиль</h1>
                <button
                    onClick={() => router.push('/orderHistory')}
                    className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 font-semibold rounded shadow"
                >
                    История покупок
                </button>
            </div>

            <div className="space-y-10">
                {/* Данные пользователя */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Данные пользователя</h2>
                    <div className="space-y-2 pl-4">
                        <p><strong>Имя:</strong> {user.name}</p>
                        <p><strong>Фамилия:</strong> {user.surname}</p>
                        <p><strong>E-mail:</strong> {user.email}</p>
                        <p><strong>Пароль:</strong> ***</p>
                        <p><strong>Телефон:</strong> {user.phone}</p>
                    </div>
                </div>

                {/* Контактная информация */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        Контактная информация
                        {!isEditing && (
                            <span
                                onClick={() => setIsEditing(true)}
                                className="text-sm underline ml-2 cursor-pointer"
                            >
                                Изменить
                            </span>
                        )}
                    </h2>

                    {!isEditing ? (
                        <div className="space-y-2 pl-4">
                            <p>{user.phone}</p>
                            <p>{user.address || 'Адрес не указан'}, {user.postal || ''} {user.city || ''}</p>
                            <div className="flex gap-4 text-sm">
                                <button className="underline" onClick={() => setIsEditing(true)}>Изменить</button>
                                <button className="underline" onClick={handleDeleteAddress}>Удалить</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 pl-4">
                            <input
                                placeholder="Адрес"
                                defaultValue={user.address}
                                className="w-full p-2 border rounded"
                                onChange={(e) => setEdited(prev => ({ ...prev, address: e.target.value }))}
                            />
                            <input
                                placeholder="Почтовый индекс"
                                defaultValue={user.postal}
                                className="w-full p-2 border rounded"
                                onChange={(e) => setEdited(prev => ({ ...prev, postal: e.target.value }))}
                            />
                            <input
                                placeholder="Город"
                                defaultValue={user.city}
                                className="w-full p-2 border rounded"
                                onChange={(e) => setEdited(prev => ({ ...prev, city: e.target.value }))}
                            />
                            <div className="flex gap-4 text-sm mt-2">
                                <button onClick={handleSave} className="underline">Сохранить</button>
                                <button onClick={() => setIsEditing(false)} className="underline">Отмена</button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold block">Телефон:</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">+371</span>
                                    <input
                                        className="border p-2 rounded w-full"
                                        value={editedPhone}
                                        onChange={(e) => setEditedPhone(e.target.value)}
                                        placeholder="Введите номер"
                                    />
                                </div>
                                <div className="flex gap-4 text-sm mt-2">
                                    <button onClick={handleSave} className="underline">Сохранить</button>
                                    <button onClick={() => setIsEditing(false)} className="underline">Отменить</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Удаление аккаунта */}
            <div className="flex justify-center mt-10">
                <button
                    onClick={handleDeleteAccount}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded shadow"
                >
                    Удалить аккаунт
                </button>
            </div>
        </div>
    )
}
