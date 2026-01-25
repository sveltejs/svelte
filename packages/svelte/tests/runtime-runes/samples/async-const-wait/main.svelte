<script>
	let { a_promise, b_promise } = $props();
</script>

<svelte:boundary>
	{@const a = await a_promise}
	{#if true}
		<svelte:boundary>
			{@const b = await b_promise}
			{#if true}
				{@const sum = a + b}
				<p>{sum}</p>
			{/if}
		</svelte:boundary>
	{/if}
</svelte:boundary>
