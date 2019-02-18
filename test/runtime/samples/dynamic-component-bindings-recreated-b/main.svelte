<script>
	import Green from './Green.svelte';
	import Red from './Red.svelte';

	export let foo;
	export let x;
</script>

<p>parent {foo}</p>
<svelte:component this="{x ? Green : Red}" bind:foo />