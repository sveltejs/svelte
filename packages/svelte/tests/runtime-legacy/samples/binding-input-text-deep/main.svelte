<script>
	export let user;
</script>

<input bind:value={user.name}>
<p>hello {user.name}</p>