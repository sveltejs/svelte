<script>
	export let visible;
	export let rows;
	export let cols;

	function foo(node) {
		return {
			duration: 100,
			tick: t => node.foo = t
		};
	}
</script>

{#if visible}
	{#each rows as row}
		<div out:foo class="row">
			{#each cols as col}
				<div out:foo class="cell">{row}, {col}</div>
			{/each}
		</div>
	{/each}
{/if}