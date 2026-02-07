import ConfirmClient from './ConfirmClient'
import { Suspense } from 'react'

export default function ConfirmPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Загрузка...</div>}>
            <ConfirmClient />
        </Suspense>
    )
}
