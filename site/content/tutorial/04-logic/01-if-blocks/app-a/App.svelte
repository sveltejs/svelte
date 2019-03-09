<script>
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}
</script>

<button on:click={toggle}>
	Log out
</button>

<button on:click={toggle}>
	Log in
</button>