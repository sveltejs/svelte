<script>
	let a = $state(1);
	let b = $state(2);

	async function a_plus_b() {
		return await a + await b;
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>

<svelte:boundary>
	<h1>{await a_plus_b()}</h1>
	<p>{await a + await b}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
