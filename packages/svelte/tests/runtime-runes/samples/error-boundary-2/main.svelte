<script>
	function throw_error() {
		throw new Error('test')
	}

	let count = $state(0);
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	{count > 0 ? throw_error() : null}
</svelte:boundary>

<button onclick={() => count++}>+</button>


