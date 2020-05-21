<script>
	export let visible;
	export let resolve

	function foo(node, params) {
		return new Promise(r => {
			resolve = r
		});
	}
</script>

{#if visible}
	<span out:foo>hello</span>
{/if}
