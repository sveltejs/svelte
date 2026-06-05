<script>
	import Child from './Child.svelte';

	let open = $state(false);
</script>

<svelte:boundary>
	<button onclick={() => (open = true)}>show</button>

	{#if open}
		<svelte:boundary>
			<Child />

			{#snippet pending()}
				<p>loading…</p>
			{/snippet}

			{#snippet failed()}
				<p>error was contained</p>
			{/snippet}
		</svelte:boundary>
	{/if}

	{#snippet failed()}
		<p>error escaped containment</p>
	{/snippet}
</svelte:boundary>
