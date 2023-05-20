<script>
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}
</script>

<button on:click={toggle}>
	{#if user.loggedIn}
		Log out
	{/if}
	{#if !user.loggedIn}
		Log In
	{/if}
</button>
