<script>
	let { children } = $props();

	let inited = $state(false);

	$effect(() => {
		inited = true;
	});
</script>

 <span>{@render children()}</span>
