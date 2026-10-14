<script>
	let { data, children } = $props();

	let { root, child } = $derived(data);

	$effect(() => {
		console.log(root, child);
	});
</script>

{@render children?.()}
