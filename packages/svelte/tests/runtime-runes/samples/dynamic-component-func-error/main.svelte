<script>
	import A from "./A.svelte";
</script>

{#snippet snip(comp, func)}
	<svelte:component this={comp} prop={func(10)}></svelte:component>
{/snippet}

{@render snip(A)}
