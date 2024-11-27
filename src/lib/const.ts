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
    success: false
    type: typeof ERROR
    body: {
        error: string
    }
}

export type ActionResultSuccess<T> = {
    success: true
    type: typeof SUCCESS
    body: T
}

export const DEVICE_ID_COOKIE = 'device-id'
