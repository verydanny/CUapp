import type { ParamMatcher } from '@sveltejs/kit'

export const match = ((param: string): param is 'signin' | 'signup' | 'signupusername' => {
    return param === 'signin' || param === 'signup' || param === 'signupusername'
}) satisfies ParamMatcher
