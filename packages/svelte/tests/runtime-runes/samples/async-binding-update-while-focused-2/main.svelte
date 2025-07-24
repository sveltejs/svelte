<script lang="ts">
	let count = $state(0);

	let deferreds = [];

	export function shift() {
		const d = deferreds.shift();
		d.d.resolve(d.v);
	}

	function push(v) {
		const d = Promise.withResolvers();
		deferreds.push({ d, v });
		return d.promise;
	}
</script>

<svelte:boundary>
	<input type="number" bind:value={count} />
	<p>{await push(count)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
