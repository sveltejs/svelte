<script>
	export let y = false;
	export let x = 'x';

	import Foo from './Foo.svelte';
</script>

{#if y}
	<Foo/>
{:else}
	<span>{x}</span>
{/if}