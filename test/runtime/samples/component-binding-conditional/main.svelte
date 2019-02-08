<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';
	import Baz from './Baz.svelte';

	export let y;
	export let x;
</script>

<p>y: {y}</p>

{#if x}
	<Foo bind:y/>
{:else}
	<Bar bind:y/>
{/if}

<Baz bind:x/>