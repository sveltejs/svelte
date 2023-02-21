<script>
	export let element = 'div';
</script>

<svelte:element this={element} />

<h2>
	<svelte:element this={element}>
		<b>text</b>
	</svelte:element>
</h2>

<style>
	div {
		color: red;
	}
	h2 > p {
		color: red;
	}
	h2 span {
		color: red;
	}
	h2 > span > b {
		color: red;
	}
	h2 span b {
		color: red;
	}
	h2 b {
		color: red;
	}
</style>
