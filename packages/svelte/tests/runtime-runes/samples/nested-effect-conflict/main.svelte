<script>
	let c = $state({ a: 0 });

	$effect(() => {
		console.log('top level')
		$effect(() => {
			if (c) {
				$effect(() => {
					console.log('inner',c.a);
					return () => console.log('destroy inner', c?.a);
				});
			}
			return () => console.log('destroy outer', c?.a);
		});
	});
</script>

<button onclick={() => {
	c.a = 1; c = null
}}>toggle</button>
