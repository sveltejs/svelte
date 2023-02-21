<script>
	import Foo from './Foo.svelte';
	export let top = false;
	export let middle = false;
	export let bottom = false;
</script>

<Foo>
	{#if top}
		<svelte:fragment slot="top">Top content</svelte:fragment>
	{/if}
	{#if middle}
		<svelte:fragment slot="middle">Middle content</svelte:fragment>
	{/if}
	{#if bottom}
		<svelte:fragment slot="bottom">Bottom content</svelte:fragment>
	{/if}
</Foo>
