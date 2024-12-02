<svelte:options runes={false} />

<script>
	function ok($) {}
	function ok2() {
		let $;
	}

	// error
	let $;
</script>
