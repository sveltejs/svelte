<script>
	let must_throw = $state(false);

	function throw_error() {
		throw new Error("error on template render");
	}
</script>

<svelte:boundary onerror={(_, reset) => reset()}>
	{must_throw ? throw_error() : 'normal content'}

	{#snippet failed()}
		<div>err</div>
	{/snippet}
</svelte:boundary>

<button onclick={() => must_throw = true}>trigger throw</button>
