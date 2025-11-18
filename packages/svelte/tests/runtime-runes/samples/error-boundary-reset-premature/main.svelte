<script>
	let must_throw = $state(false);
	let reset = $state(null);

	function throw_error() {
		throw new Error("error on template render");
	}
</script>

<svelte:boundary onerror={console.error}>
	<svelte:boundary onerror={(_, fn) => (reset = fn)}>
		{must_throw ? throw_error() : 'normal content'}

		{#snippet failed()}
			<div>err</div>
		{/snippet}
	</svelte:boundary>
</svelte:boundary>

<button
	onclick={() => {
		must_throw = !must_throw;
		if (reset) reset();
	}}>
	toggle
</button>
