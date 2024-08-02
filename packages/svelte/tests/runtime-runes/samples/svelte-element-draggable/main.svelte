<script>
	let attrs = $state({ draggable: 'false' });
</script>

<svelte:element this={'div'} draggable="false"></svelte:element>

<div {...attrs}></div>
