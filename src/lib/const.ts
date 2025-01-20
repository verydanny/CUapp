export const SUCCESS = 'success' as const
export const ERROR = 'error' as const
export const REDIRECT = 'redirect' as const

export interface ActionResultRedirect {
    type: typeof REDIRECT
    body: {
        status: number
        url: string
    }
}

export interface ActionResultError {
    type: typeof ERROR
    body: {
        error: string
    }
}

export type ActionResultSuccess<T0, T> = {
    type: typeof SUCCESS
    name: T0
    body: T
}

export const DEVICE_ID_COOKIE = 'device-id'
