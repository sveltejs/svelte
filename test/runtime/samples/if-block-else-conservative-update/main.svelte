<script>
	export let fn;
	export let other_fn;
	export let foo;
</script>

{#if fn()}
	<p>{foo}</p>
{:else if other_fn()}
	<p>{foo.toUpperCase()}</p>
{/if}