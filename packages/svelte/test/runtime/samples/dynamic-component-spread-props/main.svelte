<script>
	import Comp1 from './Comp1.svelte';
	import Comp2 from './Comp2.svelte';

	let view = Comp1;

	$: props = view === Comp1 ? { value: 1 } : { value: 2 };
</script>

<svelte:component this={view} {...props} />

<button on:click={(e) => (view = view === Comp1 ? Comp2 : Comp1)}>Toggle Component</button>
