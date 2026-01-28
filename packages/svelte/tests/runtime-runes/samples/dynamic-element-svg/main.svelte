<script>
	let props = {
		height: '100px',
		width: '100px',
		viewBox: '0 0 1000 1000'
	};
</script>

<svelte:element this={'svg'} {...props}>
	<circle cx="500" cy="500" r="500"></circle>
</svelte:element>
