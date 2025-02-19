<script lang="ts">
    import '../app.css'
    import Navbar from '$layout/components/navbar.svelte'

    let { children, data } = $props()
</script>

<svelte:head>
    <title>CUApp - Open Source Social Media Platform</title>
    <meta
        name="description"
        content="CUApp is an open source social media platform that allows you to connect with your friends and family."
    />
</svelte:head>

<Navbar profile={data.loggedInProfile} wasLoggedIn={data.wasLoggedIn} />

<div class="container mx-auto min-h-screen p-4">
    <main class="max-w-none">
        {@render children()}
    </main>
</div>
