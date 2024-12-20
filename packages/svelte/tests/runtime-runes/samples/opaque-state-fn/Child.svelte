<script>
	let { count } = $props();

	let [obj, invalidate] = $state.opaque({ count: 0 });

	$effect(() => {
		invalidate((obj) => {
			obj.count = count;
		});
	});
</script>

<p>{obj.count}</p>
