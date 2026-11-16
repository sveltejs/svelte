<script>
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);
	let gated = $state(false);
	const gate = Promise.withResolvers();
	const answers = new Map();

	function load(value) {
		const d = Promise.withResolvers();
		answers.set(value, d);
		return d.promise;
	}

	export function start() { a = true; x = 1; gated = true; }
	export function update() { b = true; x = 2; }
	export function hide() { a = false; }
	export function reject() { answers.get(2).reject(new Error('later')); }
	export function resolve() { answers.get(1).resolve(1); }
	export function finish() { gate.resolve(1); }
</script>

<p>{gated ? await gate.promise : 0}</p>
<svelte:boundary>
	{#if b || a}<Child {x} {load} />{/if}
	{#snippet failed(error)}<p>failed: {error.message}</p>{/snippet}
</svelte:boundary>
