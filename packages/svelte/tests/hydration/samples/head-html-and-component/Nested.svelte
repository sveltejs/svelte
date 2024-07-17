<script>
	let text = $state('foo');
</script>

<svelte:head>
	{@html '<meta name="nested_html" content="nested_html">'}
	<meta name="nested" content="nested" />
	<meta name="foo" content={text} />
</svelte:head>
