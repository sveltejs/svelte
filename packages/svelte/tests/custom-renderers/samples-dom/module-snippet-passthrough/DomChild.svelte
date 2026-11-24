<svelte:options customRenderer={null} />

<script>
	let { greeting } = $props();
</script>

<div>
	{@render greeting('world')}
</div>
