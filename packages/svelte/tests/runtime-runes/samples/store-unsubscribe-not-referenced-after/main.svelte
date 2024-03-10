<script>
	import { writable, derived } from "svelte/store";

	const obj = writable({ a: 1 });
	let count = $state(0);
	let watcherA = $state();

	function watch (prop) {
		return derived(obj, (o) => {
			count++;
			return o[prop];
		});
	}
</script>

<input type="number" bind:value={$obj.a}>
<p>{count}</p>

{#if watcherA}
	{$watcherA}
	<button on:click={() => watcherA = null}>remove watcher</button>
{:else}
	<button on:click={() => watcherA = watch("a")}>add watcher</button>
{/if}
