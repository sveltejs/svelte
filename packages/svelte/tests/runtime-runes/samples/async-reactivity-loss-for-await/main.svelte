<script>
	let values = $state([1, 2]);

	async function get_total() {
		let total = 0;

		for await (const n of values) {
			total += n;
		}

		return total;
	}
</script>

<button onclick={() => values[0]++}>a</button>
<button onclick={() => values[1]++}>b</button>

<svelte:boundary>
	<h1>{await get_total()}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
