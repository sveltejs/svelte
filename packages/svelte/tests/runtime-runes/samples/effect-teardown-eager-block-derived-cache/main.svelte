<script>
	import Child from './Child.svelte';

	let go = $state(false);
	let x = $state(0);
	let double = $derived(x * 2);
	let show = $state(false);

	$effect(() => {
		if (go) {
			x = 1;
			show = true;
		}

		return () => console.log(`writer teardown: double=${double}`);
	});

	$effect(() => {
		if (go) show = false;
	});
</script>

<button onclick={() => (go = true)}>go</button>

{#if show}
	<Child getX={() => x} getDouble={() => double} />
{/if}
