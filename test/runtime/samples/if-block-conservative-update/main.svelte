<script>
	export let fn;
	export let foo;
</script>

{#if fn()}
	<p>{foo}</p>
{/if}