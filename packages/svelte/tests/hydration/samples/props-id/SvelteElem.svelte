<script>
	let { tag = 'div' } = $props();
	let id = $props.id();
</script>

<svelte:element this={tag} id={id}>{id}</svelte:element>
