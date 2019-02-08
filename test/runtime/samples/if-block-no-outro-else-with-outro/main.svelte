<script>
	export let foo;
	export let x = 'x';

	import Widget from './Widget.svelte';
</script>

{#if foo}
	<p>foo</p>
{:else}
	<Widget/>
	<p>{x}</p>
	<input type="text" bind:value={x} />
{/if}