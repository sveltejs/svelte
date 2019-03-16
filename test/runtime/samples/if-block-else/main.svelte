<script>
	export let foo;
	export let bar;
</script>

{#if foo}
	<p>foo</p>
{:else}
	<p>not foo</p>
{/if}

{#if bar}
	<p>bar</p>
{:else}
	<p>not bar</p>
{/if}
