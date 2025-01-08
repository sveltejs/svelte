<script>
	function throw_error() {
		throw new Error('test')
	}

	let count = $state(0);
	let error = $state();
</script>

<svelte:boundary onerror={(e) => error = e}>
	{count > 0 ? throw_error() : null}
</svelte:boundary>

<button onclick={() => count++}>+</button>

{#if error}
	<div>There is an error!</div>
{/if}


