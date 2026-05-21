<script>
	let { items = $bindable() } = $props();
</script>

<ul>
	{#each items as item (item.id)}
		<li data-id={item.id}>{item.name}</li>
	{/each}
</ul>
