<script>
	export let items;
</script>

<div>
	{#each items as item, index}
		<slot name="main" {index}/>
	{/each}
</div>