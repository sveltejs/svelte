<script>
	import Foo from './Foo.svelte';

	export let p;

	export let foo;
	export let bar;
	export let baz;
</script>

<Foo bind:this={foo} bind:bar bind:baz/>
<p bind:this={p}>{bar + baz}</p>