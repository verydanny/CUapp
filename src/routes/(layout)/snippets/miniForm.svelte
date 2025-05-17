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
    text: string,
    btnClass: 'secondary' | 'neutral' | 'primary' | 'accent' | 'ghost',
    action: string,
    data?: Record<string, string | boolean | undefined>
)}
    {@const onsubmit = data ? handleSubmitData(data) : undefined}
    {@const buttonClass = `btn btn-outline btn-${btnClass}`}

    <form method="post" {action} {onsubmit}>
        <button type="submit" class={buttonClass}>{text}</button>
    </form>
{/snippet}
