<script>
	export let visible = false;

	function foo(node, _params, options) {
		node.direction = options.direction;

		return {
			duration: 10
		};
	}
</script>

{#if visible}
	<div id="both" transition:foo></div>
	<div id="in" in:foo></div>
{/if}

{#if !visible}
	<div id="out" out:foo></div>
{/if}
