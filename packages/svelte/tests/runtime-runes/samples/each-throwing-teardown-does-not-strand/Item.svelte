<script>
	let { item, onteardown } = $props();

	$effect(() => {
		return () => {
			// record that this item tore down, then throw. a throwing teardown must not
			// prevent the sibling removed items from being torn down (#18415, each.js path)
			onteardown(item);
			throw new Error(`teardown boom ${item}`);
		};
	});
</script>

<span>{item}</span>
