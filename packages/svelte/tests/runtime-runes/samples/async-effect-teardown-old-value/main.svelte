<script>
	let count = $state(0);

	let deferreds = [];

	function push(value) {
		const d = Promise.withResolvers();
		deferreds.push(() => d.resolve(value));
		return d.promise;
	}

	$effect(() => {
		console.log(`effect: ${count}`);

		return () => {
			console.log(`teardown: ${count}`);
		};
	});
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => deferreds.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push(count)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
