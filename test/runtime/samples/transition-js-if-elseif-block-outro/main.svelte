<script>
	export let yes;
	export let no;

	export let x;
	export let y;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if x}
	<div bind:this={yes} out:foo>yes</div>
{:elseif y}
	<div bind:this={no} out:foo>no</div>
{/if}