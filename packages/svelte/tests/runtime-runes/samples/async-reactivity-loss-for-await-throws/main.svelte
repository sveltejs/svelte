<script>
	let values = $state([0, 1, 2]);

	async function get_result() {
		const logs = [];

		async function* iterator() {
			yield values[0];
			yield values[1];
			yield values[2];
			throw new Error('body failed');
		}

		try {
			for await (const value of iterator()) {
				logs.push('number');
				// Read reactive state after async iterator await.
				values.length === value;
			}
			logs.push('done');
		} catch (error) {
			logs.push(error.message);
		}

		logs.push('ended');
		return logs.join(' -> ');
	}
</script>

<svelte:boundary>
	<h1>{await get_result()}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
