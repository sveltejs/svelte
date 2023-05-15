<script>
	import Foo from './Foo.svelte';

	export let x;
</script>

<p>x: {x}</p>

<Foo bind:x/>