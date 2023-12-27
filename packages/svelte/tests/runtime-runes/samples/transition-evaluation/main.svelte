<script>
	const { visible = true, foo = 1 } = $props();

	function bar(node, params) {
		node.foo = params;
		return () => ({});
	}
</script>

{#if visible}
	<div transition:bar={foo}></div>
{/if}
