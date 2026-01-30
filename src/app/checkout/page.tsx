'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {useCart} from "@/lib/context/CartContext";

export default function CheckoutPage() {
    const router = useRouter()
    const [delivery, setDelivery] = useState("home")
    const [payment, setPayment] = useState("wallet")
    const { total } = useCart();
    const [form, setForm] = useState({
        city: "",
        address: "",
        postal: "",
        apt: "",
        floor: "",
        intercom: "",
        agree: false
    })
    const [cashMethod, setCashMethod] = useState<"cash" | "card">("cash")
    const [cashAmount, setCashAmount] = useState("")

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        if (!form.agree) return alert("Подтвердите обработку данных")
        const orderId = Math.floor(10000 + Math.random() * 89999)
        router.push(`/confirm?order=${orderId}`)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-[100vh]">
            <h1 className="text-2xl font-bold mb-10">Оформление заказа</h1>

            {/* Шаг 1 */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">1 Способ доставки</h2>
                <div className="flex gap-4">
                    <button onClick={() => setDelivery("pickup")}
                            className={`px-6 cursor-pointer py-4 rounded-lg ${delivery === "pickup" ? "border border-black" : "bg-gray-100"}`}>Забрать в пакомате<br />1.99 €</button>
                    <button onClick={() => setDelivery("store")}
                            className={`px-6 cursor-pointer py-4 rounded-lg ${delivery === "store" ? "border border-black" : "bg-gray-100"}`}>Забрать в магазине</button>
                    <button onClick={() => setDelivery("home")}
                            className={`px-6 cursor-pointer py-4 rounded-lg ${delivery === "home" ? "border border-black" : "bg-gray-100"}`}>Доставка на дом<br />4.99 €</button>
                </div>
            </div>

            {/* Шаг 2 */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">2 Адрес доставки</h2>
                <div className="space-y-3">
                    <input name="city" placeholder="Город" value={form.city} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="address" placeholder="Адрес" value={form.address} onChange={handleChange} className="w-full p-2 border rounded" />
                    <input name="postal" placeholder="Почтовый индекс" value={form.postal} onChange={handleChange} className="w-full p-2 border rounded" />
                    <div className="flex gap-2">
                        <input name="apt" placeholder="Квартира" value={form.apt} onChange={handleChange} className="w-full p-2 border rounded" />
                        <input name="floor" placeholder="Этаж" value={form.floor} onChange={handleChange} className="w-full p-2 border rounded" />
                        <input name="intercom" placeholder="Код от домофона" value={form.intercom} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                </div>
            </div>

            {/* Шаг 3 */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">3 Способы оплаты</h2>

                <div className="flex gap-4 mb-4 flex-wrap">
                    <button onClick={() => setPayment("cash")}
                            className={`px-6 py-4 rounded-lg ${payment === "cash" ? "border border-black" : "bg-gray-100"}`}>
                        Оплата при получении
                    </button>
                    <button onClick={() => setPayment("wallet")}
                            className={`px-6 py-4 rounded-lg ${payment === "wallet" ? "border border-black" : "bg-gray-100"}`}>
                        Электронный кошелёк
                    </button>
                </div>

                {/* Доп. поля для оплаты при получении */}
                {payment === "cash" && (
                    <div className="space-y-4 mb-4">
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="cashMethod"
                                    value="cash"
                                    checked={cashMethod === "cash"}
                                    onChange={() => setCashMethod("cash")}
                                />
                                <span>Наличные</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="cashMethod"
                                    value="card"
                                    checked={cashMethod === "card"}
                                    onChange={() => setCashMethod("card")}
                                />
                                <span>Картой</span>
                            </label>
                        </div>

                        {cashMethod === "cash" && (
                            <div>
                                <label className="block font-medium mb-1">С какой суммы сдача?</label>
                                <input
                                    type="number"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    placeholder="Например, 100"
                                    className="w-full max-w-sm p-3 border rounded-lg outline-blue-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-6">
                    <img src="/assets/pay/gpay.svg" alt="GPay" className="h-10" />
                    <img src="/assets/pay/applepay.svg" alt="ApplePay" className="h-10" />
                    <img src="/assets/pay/samsungpay.svg" alt="SamsungPay" className="h-10" />
                    <img src="/assets/pay/paypal.svg" alt="PayPal" className="h-10" />
                </div>
            </div>

            <div className="mb-10">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
                    <span className="text-sm">Разрешаю обработать мои персональные данные</span>
                </label>
            </div>

            <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">Общая сумма к оплате : {total} €</p>
                <button onClick={handleSubmit} className="bg-yellow-400
                 hover:bg-yellow-500 px-10 py-3 font-bold rounded shadow cursor-pointer">
                    Заказать
                </button>
            </div>
        </div>
    )
}
