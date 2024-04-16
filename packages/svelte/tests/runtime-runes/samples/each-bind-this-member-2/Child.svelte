<script>
	let { item = $bindable() } = $props();
</script>

<div bind:this={item.dom}>
	{item.text}
</div>
