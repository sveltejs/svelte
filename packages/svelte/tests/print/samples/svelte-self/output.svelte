<script>
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<svelte:self count={count - 1}></svelte:self>
{:else}
	<p>lift-off!</p>
{/if}
