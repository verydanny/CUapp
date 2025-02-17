<script lang="ts">
    import type { PageProps } from './$types'

    let { form }: PageProps = $props()
</script>

<form action="?/setUsername" class="flex justify-center" method="post">
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend class="prose lg:prose-md fieldset-legend mb-0 pb-0">Set username</legend>
        {#if form?.success === false}
            <p class="text-error">
                {form?.message}
            </p>
        {/if}

        <label class="fieldset-label" for="username">Username</label>
        <label class="input validator">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
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

        <button type="submit" class="btn btn-primary mt-4">Set username</button>
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
