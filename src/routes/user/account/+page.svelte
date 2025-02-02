<script lang="ts">
    let { data } = $props()
    let user = data?.user
    let currentUser = data?.currentUser
</script>

<ul>
    <li>
        <strong>Email:</strong>
        {user?.email}
    </li>
    <li>
        <strong>Name:</strong>
        {user?.name}
    </li>
    <li>
        <strong>Username:</strong>
        {currentUser?.username}
    </li>
    <li>
        <strong>ID: </strong>
        {user?.$id}
    </li>
</ul>

<form method="post">
    <button type="submit">Log out</button>
</form>
