<script>
	const {active} = $props();
	$effect.pre(() => {
		console.log('active changed', active)
	});
</script>

<p>Item is {active ? 'active' : 'inactive'}</p>
