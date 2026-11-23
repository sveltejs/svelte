<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	let test = $derived.by(() => {
		if (doubled > 2) {
			throw new Error('test');
		}
	});
</script>

<button onclick={() => count++}>Increment</button>

<svelte:boundary onerror={(e) => {console.log('error caught 1')}}>
	{count} / {test}
</svelte:boundary>

<svelte:boundary onerror={(e) => {console.log('error caught 2')}}>
	{count} / {test}
</svelte:boundary>
