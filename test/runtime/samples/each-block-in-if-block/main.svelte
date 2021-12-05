<script>
	export let fruits;
</script>

<div>
	{#if fruits}
		{#each fruits as fruit (fruit)}
			<div>{fruit}</div>
		{/each}
	{/if}
</div>