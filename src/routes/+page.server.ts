export async function load({ locals }) {
    return {
        loggedIn: Boolean(locals.user)
    }
}
