<script>
	let { index, n, order } = $props();

	function logRender () {
		order.push(`${index}: render ${n}`);
		return index;
	}

	$effect.pre(() => {
		order.push(`${index}: $effect.pre ${n}`);

		$effect.pre(() => {
			order.push(`${index}: nested $effect.pre ${n}`);
		});
	});

	$effect(() => {
		order.push(`${index}: $effect ${n}`);
	});
</script>

<li>
	{logRender()}
</li>
