<script>
	let values = $state([0, 1, 2]);

	async function get_result() {
		const logs = [];

		const iterator = {
			index: 0,
			async next() {
				if (this.index >= values.length) return { done: true };
				return { done: false, value: values[this.index++] };
			},
			async return() {
				logs.push('return');
				throw new Error('return failed');
			},
			[Symbol.asyncIterator]() {
				return this;
			}
		};

		try {
			for await (const value of iterator) {
				logs.push('number');
				// Read reactive state after async iterator await.
				if (values.length === 3 && value === 2) {
					throw new Error('body failed');
				}
			}
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
