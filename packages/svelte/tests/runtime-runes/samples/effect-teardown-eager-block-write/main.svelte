<script>
	import Child from './Child.svelte';

	let go = $state(false);
	let value = $state(0);
	let unrelated = $state(0);
	let show = $state(true);

	$effect(() => {
		if (go) unrelated = 1;
	});

	$effect(() => {
		if (go) show = false;
	});

	$effect(() => {
		go;
		return () => console.log(`sibling teardown: value=${value}`);
	});

	function reset() {
		value = 55;
		console.log(`child teardown: value=${value}`);
	}
</script>

<button onclick={() => {
	value = 1;
	go = true;
}}>go</button>

<p>{unrelated}:{value}</p>

{#if show}
	<Child {reset} />
{/if}
