<script>
	let must_throw = $state(false);

	function throw_error() {
		throw new Error('yikes!');
	}
</script>

<button onclick={() => must_throw = !must_throw}>toggle</button>

<svelte:boundary>
	<p>{must_throw ? throw_error() : 'hello!'}</p>

	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button onclick={reset}>reset</button>
	{/snippet}
</svelte:boundary>


