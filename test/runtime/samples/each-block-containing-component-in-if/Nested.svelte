<script>
	export let show;
	export let fields;
</script>

{#if show}
	{#each fields as field}
		<span>{field}</span>
	{/each}
{/if}