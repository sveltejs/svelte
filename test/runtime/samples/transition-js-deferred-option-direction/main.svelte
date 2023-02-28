<script>
	export let visible;

	function foo(node, _params, options) {
		node.initial = options.direction;

		return (opts) => {
			node.later = opts.direction;

			return {
				duration: 10
			};
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
