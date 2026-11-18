<script>
	let count = $state(0);
</script>

{#if await Promise.resolve(true)}
	<input />
	{#if true}
		<button onclick={() => count++}>clicks: {count}</button>
	{/if}
{/if}
