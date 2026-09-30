<script>
	export let condition;
	export let tag = 'div';
</script>

<svelte:element this={tag}>
	{#if condition}<p>client</p>{:else}<span>server</span>{/if}
</svelte:element>
<p>after</p>
