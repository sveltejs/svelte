<script>
	let tag = $state('hr');
</script>

<svelte:element this={tag}>
	This text cannot appear inside an hr element
</svelte:element>
