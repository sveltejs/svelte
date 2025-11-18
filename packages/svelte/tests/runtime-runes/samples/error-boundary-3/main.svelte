<script>
	function throw_error() {
		throw new Error('oh no!')
	}

	let count = $state(0);
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	{count > 0 ? throw_error() : null}

	{#snippet failed(e)}
		<div>{e.message}</div>
	{/snippet}
</svelte:boundary>

<button onclick={() => count++}>+</button>
