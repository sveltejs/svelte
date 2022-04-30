<script>
	export let props = {
		disabled: false,
		type: 'button',
		'data-named': 'foo'
	};
</script>

<svelte:element this="button" {...props}>Click me</svelte:element>
