<script>
	import { untrack } from "svelte";

	let { double } = $props();

	// Test setup:
	// - component initialized while pending work
	// - derived that depends on mulitple sources
	// - indirect updates to subsequent deriveds
	// - two sibling effects where the former influences the latter
	// - first effect reads derived of second inside untrack
	let x = $state(0);
	const other = $derived(double + x);
	const another = $derived(other + 1);
	const another2 = $derived(another + 1);

	$effect(() => {
		untrack(() => {
			another2;
			x++
		});
	});

	$effect(() => {
		console.log(another2);
	})
</script>
