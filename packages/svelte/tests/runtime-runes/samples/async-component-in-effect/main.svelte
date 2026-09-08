<script>
	import Child from './Child.svelte';

	let anchor;
	let run = $state(false);

	$effect(() => {
		if (run) Child(anchor, {});
	});
</script>

<button onclick={() => (run = true)}>run</button>
<span bind:this={anchor}></span>
