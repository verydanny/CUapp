<script lang="ts">
    import '../app.css'
    let { children } = $props()
</script>

<div class="container mx-auto">
    {@render children()}
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }
</style>
