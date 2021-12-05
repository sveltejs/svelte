<script>
	export let yes;
	export let no;

	export let x;
	export let z;

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
	<div bind:this={yes} out:foo>{z}</div>
{:else}
	<div bind:this={no} out:foo>{z}</div>
{/if}