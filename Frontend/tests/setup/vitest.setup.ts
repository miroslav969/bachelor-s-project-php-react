import React from 'react'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

const createMotionTag = () =>
    function MotionTag({
        children,
        ...props
    }: {
        children?: React.ReactNode
        [key: string]: unknown
    }) {
        return React.createElement('div', props, children)
    }

vi.mock('framer-motion', () => {
    const motion = new Proxy(
        {},
        {
            get: () => createMotionTag()
        }
    )

    return {
        motion,
        AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
            React.createElement(React.Fragment, null, children)
    }
})

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: {
        href: string
        children?: React.ReactNode
        [key: string]: unknown
    }) =>
        React.createElement('a', { href, ...props }, children)
}))

vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        ...props
    }: {
        src: string
        alt?: string
        [key: string]: unknown
    }) => React.createElement('img', { src, alt: alt ?? '', ...props })
}))

vi.mock('next/font/google', () => ({
    Roboto: () => ({
        variable: '--font-roboto'
    })
}))

vi.mock('swiper/react', () => ({
    Swiper: ({
        children,
        ...props
    }: {
        children?: React.ReactNode
        [key: string]: unknown
    }) => React.createElement('div', { 'data-testid': 'swiper', ...props }, children),
    SwiperSlide: ({
        children,
        ...props
    }: {
        children?: React.ReactNode
        [key: string]: unknown
    }) =>
        React.createElement('div', { 'data-testid': 'swiper-slide', ...props }, children)
}))

vi.mock('swiper/modules', () => ({
    Autoplay: {},
    Pagination: {},
    Navigation: {}
}))

vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/pagination', () => ({}))
vi.mock('swiper/css/navigation', () => ({}))

const routerState = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn()
}

let searchParamsState = new URLSearchParams()

vi.mock('next/navigation', () => ({
    useRouter: () => routerState,
    useSearchParams: () => searchParamsState,
    usePathname: () => '/'
}))

Object.defineProperty(globalThis, '__TEST_ROUTER__', {
    configurable: true,
    value: routerState
})

Object.defineProperty(globalThis, '__setTestSearchParams__', {
    configurable: true,
    value: (value: string | URLSearchParams) => {
        searchParamsState =
            value instanceof URLSearchParams ? value : new URLSearchParams(value)
    }
})

if (typeof window !== 'undefined') {
    if (!window.matchMedia) {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => {},
                removeListener: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => false
            })
        })
    }

    if (!globalThis.ResizeObserver) {
        class ResizeObserverMock {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        // @ts-expect-error test shim
        globalThis.ResizeObserver = ResizeObserverMock
    }

    window.scrollTo = vi.fn()
}

afterEach(() => {
    cleanup()
    routerState.push.mockReset()
    routerState.replace.mockReset()
    routerState.prefetch.mockReset()
    routerState.back.mockReset()
    routerState.refresh.mockReset()
    searchParamsState = new URLSearchParams()
})
