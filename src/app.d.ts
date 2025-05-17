// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Models } from 'node-appwrite'

export type User = Pick<User, '$id' | 'email' | 'name' | 'phone' | 'labels'>

type WithUndefined<T> = {
    [P in keyof T]: T[P] | undefined
}

export interface BasicProfile {
    $id: string | undefined
    username: string | undefined
    profileImage: string | undefined
}

export interface Profile extends BasicProfile {
    isProfileOwner: boolean
}

export interface UserWithAdmin
    extends WithUndefined<
        Pick<Models.User<Models.Preferences>, '$id' | 'email' | 'name' | 'phone' | 'labels'>
    > {
    userIsAdmin: boolean
    userWasLoggedIn: boolean
}

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: UserWithAdmin
            // profile: Profile
        }

        interface Params {
            profile?: string
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}
