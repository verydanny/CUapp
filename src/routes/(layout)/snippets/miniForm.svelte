<script lang="ts" module>
    import type { ActionResult } from '@sveltejs/kit';
    import { applyAction, deserialize } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    function handleSubmitData<T extends Record<string, string | boolean | undefined>>(data: T) {
        return async function (
            event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
        ) {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    formData.set(key, String(value));
                });
            }

            const response = await fetch(event.currentTarget.action, {
                method: event.currentTarget.method,
                body: formData
            });

            const result: ActionResult = deserialize(await response.text());

            if (result.type === 'success') {
                await invalidateAll();
            }

            applyAction(result);
        };
    }

    export { formOutlineButton };
</script>

{#snippet formOutlineButton(
    action: string,
    text: string,
    btnClasses: string | null = null,
    formClasses: string | null = null,
    data?: Record<string, string | boolean | undefined>
)}
    {@const onsubmit = data ? handleSubmitData(data) : undefined}

    <form method="post" {action} {onsubmit} class={formClasses ? `form ${formClasses}` : 'form'}>
        <button type="submit" class={btnClasses ? `btn ${btnClasses}` : 'btn'}>{text}</button>
    </form>
{/snippet}
