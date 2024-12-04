<script>
	let { x } = $props();

	$effect(() => {
		console.log('init')

		x = () => {
			console.log('teardown')
		}

		return () => {
			x();
		}
	})
</script>
