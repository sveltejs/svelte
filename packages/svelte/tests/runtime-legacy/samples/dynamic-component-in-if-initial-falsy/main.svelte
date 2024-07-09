<script>
	import Foo from './Foo.svelte';

	/** @type {typeof Foo | null} */
	let component = null;

	let show = true;
</script>

<button on:click={() => (component = component ? null : Foo)}>toggle component</button>
<button on:click={() => (show = !show)}>toggle show</button>

{#if show}
	<svelte:component this={component} />
{/if}
