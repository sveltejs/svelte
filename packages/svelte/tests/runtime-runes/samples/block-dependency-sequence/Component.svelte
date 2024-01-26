<script>
	const { item } = $props();
</script>

<div>
	{#if item}
		{item.length}
	{/if}
</div>
