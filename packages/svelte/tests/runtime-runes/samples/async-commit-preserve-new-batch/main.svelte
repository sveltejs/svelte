<script>
	let count = $state(-1);
	let payload = $state(false);
	let updated = $state(false);

	function push(value) {
		const deferred = Promise.withResolvers();
		return deferred.promise;
	}

	$effect(() => {
		if (payload) {
			updated = true;
		}
	});

	function update() {
		count = 0;
		queueMicrotask(() => {
			payload = true;
		});
	}
</script>

<button onclick={update}>update</button>

<p>{updated}</p>

<svelte:boundary>
	{await push(count)}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
