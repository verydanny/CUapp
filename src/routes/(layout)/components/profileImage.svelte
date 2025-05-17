<script lang="ts">
    interface Props {
        imageUrl?: string | undefined;
    }

    let { imageUrl }: Props = $props();
</script>

<div class="avatar avatar-online">
    <div class="w-24 rounded-full">
        {#key imageUrl}
            <img src={imageUrl} alt="Profile" fetchpriority="high" />
        {/key}
    </div>
</div>
