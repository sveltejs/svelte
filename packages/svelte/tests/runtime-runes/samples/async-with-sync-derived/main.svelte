<script>
	let x = $state(1);
	let y = $derived(x);
	let other = $state(1);
</script>

<svelte:boundary>
	<button onclick={() => console.log({ x, y })}>log</button>
	<button onclick={() => x += 1}>x {x}</button>
	<button onclick={() => other += 1}>other {other}</button>

	<p>{x}</p>
	<p>{await x}</p>
	<p>{y}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
