<script>
	export let tagName = 'dynamic-element'
</script>

<svelte:element this={tagName}>
	<header slot='header'>header header header</header>
</svelte:element>