<script>
	import Child from './Child.svelte';

	let visible = $state(false);
	let x = $state(0);
	let gate = $state(false);
	const queue = new Map();

	function push(label, value, signal) {
		const d = Promise.withResolvers();
		// Intentionally ignore signal: stale results are automatically suppressed.
		queue.set(`${label} ${value}`, d);
		return d.promise;
	}

	function resolve(label, value) {
		queue.get(`${label} ${value}`)?.resolve(value);
	}
</script>

<button onclick={() => (visible = true, x = 1)}>show</button>
<button onclick={() => (x++, gate = x)}>update</button>
<button onclick={() => (visible = gate = false)}>hide</button>

<button onclick={() => resolve('value', 3)}>resolve value 3</button>
<button onclick={() => resolve('other', 3)}>resolve other 3</button>
<button onclick={() => resolve('gate', 3)}>resolve gate 3</button>

<button onclick={() => resolve('value', 1)}>resolve value 1</button>
<button onclick={() => resolve('value', 2)}>resolve value 2</button>
<button onclick={() => resolve('other', 2)}>resolve other 2</button>
<button onclick={() => resolve('gate', 2)}>resolve gate 2</button>

<output>
	{#if gate || visible}
		<Child {x} {push} label="value" />
	{/if}

	{#if gate}
		<Child {x} {push} label="other" />
		<span>{await push('gate', x)}</span>
	{/if}

	{$effect.pending()}
</output>
