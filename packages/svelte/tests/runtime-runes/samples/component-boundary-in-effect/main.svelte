<script>
	import Child from './Child.svelte';

	let anchor = $state();
	let run = $state(false);

	function capture(node) {
		anchor = node;
		return () => (anchor = undefined);
	}

	$effect(() => {
		if (run && anchor) Child(anchor, {});
	});
</script>

<button onclick={() => (run = !run)}>run</button>
<span {@attach capture}></span>
