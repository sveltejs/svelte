<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';
	import Baz from './Baz.svelte';

	export let x;
	export let tag = 'you\'re it';
	export let foo;
	export let bar;
	export let things = ['a', 'b', 'c'];
</script>

<svelte:component this="{ x ? Foo : Bar }" x='{x}'>
	<p>element</p>

	{tag}

	{#if foo}
		<p>foo</p>
	{:elseif bar}
		<p>bar</p>
	{:else}
		<p>neither foo nor bar</p>
	{/if}

	text

	{#each things as thing}
		<span>{thing}</span>
	{/each}

	<Baz/>

	<div slot='other'>what goes up must come down</div>
</svelte:component>