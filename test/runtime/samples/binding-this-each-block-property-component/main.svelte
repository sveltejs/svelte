<script>
	import Foo from './Foo.svelte';

	export let visible = false;

	export let items = [{ value: 'a', ref: null }];
</script>

{#if visible}
	{#each items as item}
		<Foo bind:this={item.ref}>{item.value}</Foo>
	{/each}
{/if}
