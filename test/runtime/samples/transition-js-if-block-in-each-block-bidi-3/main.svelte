<script>
	export let visible;
	export let threshold;

	function foo(node) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as number}
	{#if visible}
		{#if threshold >= number}
			<div transition:foo>{number}</div>
		{/if}
	{:else}
		{#if threshold >= number}
			<div transition:foo>{number}</div>
		{/if}
	{/if}
{/each}