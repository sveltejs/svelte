<script>
	let current = { active: false };
	let count = 0;

	function toggle() {
		if (current.active = !current.active) {
			count += 1;
		}
	}
</script>

<button on:click={toggle}>{current.active} {count}</button>