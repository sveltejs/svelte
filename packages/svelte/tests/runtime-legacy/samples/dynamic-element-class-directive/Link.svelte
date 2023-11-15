<script>
	export let item;
</script>

<svelte:element this="div" class:active={true}>
	{item.text}
</svelte:element>

<style>
	.active {
		color: red;
	}
</style>
