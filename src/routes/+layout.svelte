<script lang="ts">
    import '../app.css';
    import Navbar from './(layout)/components/navbar.svelte';

    let { children, data } = $props();
</script>

<svelte:head>
    <title>CUApp - Open Source Social Media Platform</title>
    <meta
        name="description"
        content="CUApp is an open source social media platform that allows you to connect with your friends and family."
    />
</svelte:head>

<div id="root">
    <Navbar loggedInProfile={data.loggedInProfile} loggedInUser={data.loggedInUser} />
    <div class="container mx-auto min-h-screen p-4">
        <main class="mx-auto flex min-h-screen flex-col">
            {@render children()}
        </main>
    </div>
</div>
