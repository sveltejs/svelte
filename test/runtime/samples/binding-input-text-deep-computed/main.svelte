<script>
	export let user;
	export let prop;
</script>

<input bind:value={user[prop]}>
<p>hello {user.name}</p>