<script>
	import Foo from "./Foo.svelte";
	export let condition = false;
</script>

<Foo>
	{#if condition}
		hello #1
	{/if}
</Foo>

<Foo>
	{#if condition}
		<svelte:fragment slot="default">hello #2</svelte:fragment>
	{/if}
</Foo>
