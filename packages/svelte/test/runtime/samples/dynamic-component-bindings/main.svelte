<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let x;
	export let y;
	export let z;
</script>

<svelte:component this="{ x ? Foo : Bar }" bind:y bind:z/>