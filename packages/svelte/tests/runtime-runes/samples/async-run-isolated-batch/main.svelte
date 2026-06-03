<script module>
	const queued = [];
	export function push(v) {
		return new Promise((fulfil) => {
			queued.push(() => fulfil(v));
		});
	}
</script>

<script>
	import Child from "./Child.svelte";

	let show = $state(false);
	let count = $state(0);
</script>

{#if show}
	<Child />
{/if}

<button onclick={() => show = true}>show</button>
<button onclick={() => queued.shift()?.()}>resolve</button>
<button onclick={() => count++}>{count}</button>
