<script>
	let props = {
		value: 'bar',
		form: 'qux',
		list: 'quu',
	};
</script>

<svelte:head>
  <title {...props}>Foo</title>
</svelte:head>
