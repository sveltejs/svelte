<script>
	import Child from "./Child.svelte"
</script>

<svelte:boundary>
	<p>This should be removed</p>

	{#if true}
		<Child />
	{/if}

	{#snippet failed()}
		<p>error occurred</p>
	{/snippet}
</svelte:boundary>
