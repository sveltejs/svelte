<svelte:options accessors={true}/>

<script>
	export let foo;
	export let bar;
</script>

{#if foo}
	<p>foo!</p>
{/if}

{#if bar}
	<p>bar!</p>
{/if}