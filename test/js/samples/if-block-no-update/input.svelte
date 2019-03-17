<script>
	export let foo;
</script>

{#if foo}
	<p>foo!</p>
{:else}
	<p>not foo!</p>
{/if}