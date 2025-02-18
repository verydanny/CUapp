export const IS_PRIVATE_PROFILE = 'is_private_profile'

export const routes = {
    profile: '/user/[profile]',
    auth: {
        signin: '/auth/signin',
        signup: '/auth/signup'
    }
} as const

export const ADMIN_LABEL = 'is_admin_user'
