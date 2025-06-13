<script>
	let { value } = $props()

	const text = $derived(value.toString())

	$effect(() => console.log(text))
</script>
