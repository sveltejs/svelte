<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export { Bar };
	export let x = Foo;
</script>

{#if x}
	<svelte:component this={x}/>
{/if}