<script>
	export let items;
</script>

<div>
	{#each items as item, index}
		<slot {index}/>
	{/each}
</div>