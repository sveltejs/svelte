<script>
	import Comp1 from './Comp1.svelte';
	import Comp2 from './Comp2.svelte';

	let view = Comp1;

	$: props = view === Comp1 ? { value: 1 } : { value: 2 };
	const bar = "bar";
	function cb() {}
</script>

<svelte:component this={view} {...props} foo={bar} {cb} />

<button on:click={(e) => (view = view === Comp1 ? Comp2 : Comp1)}>Toggle Component</button>
