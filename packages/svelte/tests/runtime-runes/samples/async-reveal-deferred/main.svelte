<script>
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let count = $state(0);
	let x = $state(0);

	let resolvers = [];

	function push(v) {
		if (v === 0) return v;
		return new Promise((r) => resolvers.push(() => r(v)));
	}

	// `b || a` rather than `a || b`, so that the pending batch (which sets `a`) doesn't
	// short-circuit and the blocks also depend on `b`, which is set by the unrelated batch
	let items = $derived(b || a ? [1] : []);
	let empty = $derived(b || a ? [] : [1]);
</script>

<button onclick={() => { a = true; x++; }}>a</button>
<button onclick={() => (b = true)}>b</button>
<button onclick={() => resolvers.shift()?.()}>shift</button>
<button onclick={() => count++}>inc</button>

<p>{await push(x)}</p>

{#if b || a}
	<Child {count} />
{/if}

{#each items as item (item)}
	<span>item {item} {count}</span>
{/each}

{#each empty as item (item)}
	<span>item {item}</span>
{:else}
	<span>fallback {count}</span>
{/each}
