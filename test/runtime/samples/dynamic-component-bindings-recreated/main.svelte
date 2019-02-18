<script>
	import Green from './Green.svelte';
	import Red from './Red.svelte';

	export let x;
	export let foo;
</script>

<svelte:component this="{x ? Green : Red}" bind:foo />