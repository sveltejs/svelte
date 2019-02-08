<script>
	export let foo = true;

	import Component from './Component.svelte';
</script>

{#if foo}
	<Component/>
{:else}
	<Component/>
{/if}

{#if foo}
	<div></div>
{:else}
	<div></div>
{/if}
