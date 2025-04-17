<script>
  let a = $state("");
</script>

<svelte:boundary>
	{@const x = a}
	{#snippet failed()}
		{x}
	{/snippet}
	<FlakyComponent />
</svelte:boundary>