<script lang="ts">
    import { scale } from 'svelte/transition'

    let { imageUrl } = $props<{ imageUrl: string | null }>()
</script>

<figure class="relative">
    <picture>
        {#key imageUrl}
            <img
                src={imageUrl}
                alt="Profile"
                class="mx-auto mt-4 h-32 w-32 cursor-pointer rounded-full object-cover"
                transition:scale={{ duration: 200 }}
                fetchpriority="high"
            />
        {/key}
    </picture>
</figure>
