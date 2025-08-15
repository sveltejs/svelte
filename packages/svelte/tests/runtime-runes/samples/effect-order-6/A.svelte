<script>
	import B from './B.svelte';

	let { boolean, closed, close } = $props();

	// this runs after the effect in B, because child effects run first
	$effect(() => {
		console.log({ boolean, closed });
	});
</script>

<B {closed} {close} />
