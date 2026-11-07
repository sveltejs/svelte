<script>
	let count = $state(0);
</script>

<input />
{#if true}
	<button onclick={() => count++}>clicks: {count}</button>
{/if}
