<script>
	export let visible;

	function foo(node, _params, options) {
		node.directions = options.direction;

		return (opts) => {
			node.directions += "," + opts.direction;

			return {
				duration: 10
			};
		};
	}
</script>

{#if visible}
	<div id="both-in" transition:foo />
	<div id="in" in:foo />
{/if}

{#if !visible}
	<div id="out" out:foo />
	<div id="both-out" transition:foo={{ duration: 500 }} />
{/if}
