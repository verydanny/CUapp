<script lang="ts">
    let { data } = $props()
    let user = data?.user
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
        <strong>ID: </strong>
        {user?.$id}
    </li>
</ul>

<form method="post">
    <button type="submit">Log out</button>
</form>
