<script>
	let a = $state(1);
	let b = $state(2);
</script>

<button onclick={() => {a += 1; b += 1;}}>both</button>
<button onclick={() => {a += 1;}}>a</button>
<button onclick={() => {b += 1;}}>b</button>

<svelte:boundary>
	<p>{a} * 2 = {await (a * 2)}</p>
	<p>{b} * 2 = {b * 2}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
