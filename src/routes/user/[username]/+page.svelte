<script lang="ts">
    let profile = {
        name: 'John Doe',
        avatar: 'https://placehold.co/100x100',
        $createdAt: new Date()
    }
    let isOwner = false
</script>

<div class="profile-card">
    <h1>{profile.name}</h1>
    <div class="avatar">
        <img src={profile.avatar} alt={profile.name} />
    </div>

    {#if isOwner}
        <div class="owner-actions">
            <a href="/user/account" class="btn btn-primary">Edit Profile</a>
            <!-- Add more owner-specific actions -->
        </div>
    {:else}
        <div class="public-info">
            <p>Joined: {new Date(profile.$createdAt).toLocaleDateString()}</p>
            <!-- Add public profile content -->
        </div>
    {/if}
</div>
