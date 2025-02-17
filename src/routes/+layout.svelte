<script lang="ts">
    import '../app.css'
    let { children } = $props()
</script>

<div class="text-base-content container mx-auto min-h-screen p-4 md:p-6">
    <main class="prose max-w-none">
        {@render children()}
    </main>
</div>

<style lang="css">
    :global(*) {
        box-sizing: border-box;
    }

    :global(body) {
        font-family:
            system-ui,
            -apple-system,
            sans-serif;
    }
</style>
