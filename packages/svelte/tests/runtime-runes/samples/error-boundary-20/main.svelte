<script>
	import Child from "./Child.svelte"
</script>
<svelte:boundary>
	<Child />

	{#snippet failed()}
		<div class="error">An error occurred!</div>
	{/snippet}
</svelte:boundary>
