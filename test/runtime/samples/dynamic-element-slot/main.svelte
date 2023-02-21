<script>
	import Foo from './Foo.svelte';
	export let tag = "h1";
</script>

<Foo>
	<svelte:element this={tag}>This is default slot</svelte:element>
	<svelte:element this={tag} slot='other'>This is other slot</svelte:element>
</Foo>

