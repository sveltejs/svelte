<script>
	import Child from "./Child.svelte";
	let show = $state(true);
	let child = $state();
	let increment;
	$effect(() => {
		if (child) increment = child.increment;
	});
</script>

<button onclick={() => show = false}>hide</button>
<button onclick={() => increment()}>increment</button>
{#if show}
	<Child bind:this={child} />
{/if}
