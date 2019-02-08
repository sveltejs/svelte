<script>
	export let foo;
	export let x;
</script>

{#if x}
	<canvas bind:this={foo} data-x='true'></canvas>
{:else}
	<canvas bind:this={foo} data-x='false'></canvas>
{/if}
