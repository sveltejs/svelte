<script>
	export let condition = true;

	function foo(node) {
		return {
			duration: 100,
			tick: t => {
				node.setAttribute('foo', t);
			}
		};
	}
</script>

{#if condition}
	<div id="t" out:foo>TRUE</div>
{:else}
	<div id="f" out:foo>FALSE</div>
{/if}