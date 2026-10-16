<script>
	export let promise;
	let broken = true;

	function render(value) {
		if (broken) throw new Error('then');
		return value;
	}
</script>

<svelte:boundary>
	<svelte:boundary onerror={(error) => { throw error; }}>
		{#await promise}
			<p>loading</p>
		{:then value}
			<p>{render(value)}</p>
		{/await}
	</svelte:boundary>

	{#snippet failed(error, reset)}
		<p>failed: {error.message}</p>
		<button onclick={() => { broken = false; reset(); }}>reset</button>
	{/snippet}
</svelte:boundary>
