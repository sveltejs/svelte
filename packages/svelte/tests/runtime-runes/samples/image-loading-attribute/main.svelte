<script>
	let loading = $state('lazy')

	$effect(() => {
		loading = 'eager'
	})
</script>

<img alt="Svelte" src="foo.png" {loading} />
