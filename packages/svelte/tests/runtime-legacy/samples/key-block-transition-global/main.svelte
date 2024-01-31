<script>
	export let value = 0;
	export let toggle = true;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.foo = t;
				node.oof = u;
			}
		};
	}
</script>

{#if toggle}
	{#key value}
		<div in:foo|global>{value}</div>
	{/key}
{/if}

<button on:click={() => toggle = !toggle}>toggle</button>
