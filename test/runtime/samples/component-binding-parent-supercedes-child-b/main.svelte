<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let a = true;
	export let x;
</script>

{#if a}
	<Foo bind:x/>
{:else}
	<Bar bind:x/>
{/if}

<p>x in parent: {x}</p>