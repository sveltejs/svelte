<script>
	import { settled } from 'svelte';
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

	export function show() {
		visible = true;
		x = 1;
		return settled();
	}

	export function update() {
		x++;
		gate = x;
		return settled();
	}

	export function hide() {
		visible = gate = false;
		return settled();
	}

	export function resolve(label, value) {
		queue.get(`${label} ${value}`)?.resolve(value);
	}
</script>

{#if gate || visible}
	<Child {x} {push} label="value" />
{/if}

{#if gate}
	<Child {x} {push} label="other" />
	<span>{await push('gate', x)}</span>
{/if}

<output>{$effect.pending()}</output>
