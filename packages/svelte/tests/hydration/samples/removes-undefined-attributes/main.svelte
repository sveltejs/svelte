<script>
	const { browser } = $props();

	const attributes = {
		"data-test": browser ? undefined : ""
	};
</script>

<div {...attributes}></div>
