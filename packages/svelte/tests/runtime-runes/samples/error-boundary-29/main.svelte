<script>
	let value = $state();
	let show = $state(false);
</script>

<button onclick={() => (show = true)}>show</button>

{#if show}
	<svelte:boundary>
		<p>{value.x}</p>

		{#snippet failed()}
			<p>crash</p>
		{/snippet}
	</svelte:boundary>
{/if}
