<script lang="ts">
    import type { PageProps } from './$types'

    let { form, data }: PageProps = $props()
    let { pageType, messaging } = data
</script>

<form action={`?/${pageType}`} method="post">
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend class="prose lg:prose-md fieldset-legend mb-0 pb-0">{messaging}</legend>
        {#if form?.success === false}
            <p class="text-error">
                {form?.message}
            </p>
        {/if}
        {#if pageType === 'signupusername'}
            <label class="fieldset-label" for="username">Username</label>
            <label class="input validator">
                <svg
                    class="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2.5"
                        fill="none"
                        stroke="currentColor"
                        ><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle
                            cx="12"
                            cy="7"
                            r="4"
                        ></circle></g
                    ></svg
                >
                <input
                    name="username"
                    type="input"
                    required
                    placeholder="Username"
                    pattern="[A-Za-z][A-Za-z0-9\-]*"
                    minlength="3"
                    maxlength="30"
                    title="Only letters, numbers or dash"
                />
            </label>
            <p class="validator-hint mb-2 hidden">
                Must be 3 to 30 characters
                <br />containing only letters, numbers or dash
            </p>
        {:else}
            <label class="fieldset-label" for="email">Email</label>
            <label class="input validator">
                <svg
                    class="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2.5"
                        fill="none"
                        stroke="currentColor"
                        ><rect width="20" height="16" x="2" y="4" rx="2"></rect><path
                            d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                        ></path></g
                    ></svg
                >
                <input id="email" name="email" type="email" placeholder="mail@site.com" required />
            </label>
            <div class="validator-hint mb-2 hidden">Enter valid email address</div>

            <label class="fieldset-label" for="password">Password</label>
            <label class="input validator">
                <svg
                    class="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2.5"
                        fill="none"
                        stroke="currentColor"
                        ><path
                            d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                        ></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g
                    ></svg
                >
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    minlength="8"
                    title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                />
            </label>
            {#if pageType === 'signup'}
                <p class="validator-hint mb-2 hidden">
                    Must be more than 8 characters, including
                    <br />At least one number
                    <br />At least one lowercase letter
                    <br />At least one uppercase letter
                </p>
            {:else if pageType === 'signin'}
                <p class="validator-hint mb-2 hidden">Enter your password please</p>
            {/if}
        {/if}

        <button type="submit" class="btn btn-primary mt-4">{messaging}</button>
    </fieldset>
</form>

<style>
    :global(
        body input[data-com-onepassword-filled],
        body input[data-com-onepassword-filled]:focus
    ) {
        background-clip: text !important;
    }
</style>
