<script>

	let { children } = $props()

	const snippetProps = $derived.by(() => ({
		id: '123',
		name: 'my-select'
	}))

</script>

{@render children({ props: snippetProps })}
