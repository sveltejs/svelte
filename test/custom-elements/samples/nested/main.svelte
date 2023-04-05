<svelte:options tag="my-app" />

<script>
	import Counter from "./Counter.svelte";

	export let count;
	export let counter;
</script>

<Counter bind:count bind:this={counter}>
	<span>slot {count}</span>
</Counter>
<p>clicked {count} times</p>
