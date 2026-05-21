<script>
	let { css } = $props();
</script>

<svelte:head>
	<svelte:element this="style" type="text/css">{css}</svelte:element>
</svelte:head>

<p>content</p>
