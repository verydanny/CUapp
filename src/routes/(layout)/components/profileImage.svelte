<script lang="ts">
    let { imageUrl } = $props<{ imageUrl: string | undefined }>()
</script>

<figure class="relative">
    <picture>
        {#key imageUrl}
            <img
                src={imageUrl}
                alt="Profile"
                class="mx-auto mt-4 h-32 w-32 cursor-pointer rounded-full object-cover"
                fetchpriority="high"
            />
        {/key}
    </picture>
</figure>
