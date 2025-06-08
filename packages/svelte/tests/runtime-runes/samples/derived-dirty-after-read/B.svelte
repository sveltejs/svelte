<script>
	let {config, value = $bindable()} = $props();

	$effect.pre(() => {
		config;
		value = {}
	});
</script>

b