<script>
	$effect.pre(() => {
		$effect(() => {
			console.log('effect 1')
		})
	})

	function template() {
		$effect(() => {
			console.log('effect 2')
		});
	}
</script>

{template()}
