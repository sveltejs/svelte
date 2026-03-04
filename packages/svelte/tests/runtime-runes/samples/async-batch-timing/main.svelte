<script>
	import Component from "./Component.svelte";

	let ref = $state(null);

	let foo = $derived(await 1);
</script>

<div bind:this={ref}>div</div>

<Component {ref} />

{#if foo} 
	<p></p>
{/if}
