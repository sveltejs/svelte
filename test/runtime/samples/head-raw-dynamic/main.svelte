<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let condition, foo, bar;
</script>

{#if condition === 1}
	<Foo {foo} />
{:else if condition === 2}
	<Bar {bar} />
{/if}
