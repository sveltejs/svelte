<script>
	let { p } = $props();
	$effect.pre(() => {
		console.log('running ' + p)
	})
</script>
