<script>
	export let x;
	export let y;

	function foo() {}
</script>

{#if x}
	{#if y}
		<div in:foo>...</div>
	{/if}
{/if}