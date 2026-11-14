<script>
	import { settled } from 'svelte';
	import Child from './Child.svelte';
	let visible = $state(false);
	let a = $state(0);
	let x = $state(0);
	const queue = new Map();

	function push(label, value, signal) {
		const d = Promise.withResolvers();
		queue.set(`${label} ${value}`, d);
		return d.promise;
	}

	export function first() {
		visible = true;
		a = 1;
		return settled();
	}
	export function middle() {
		x = 1;
		return settled();
	}
	export function last() {
		a = 2;
		x = 2;
		return settled();
	}
	export function resolve(label, value) {
		queue.get(`${label} ${value}`)?.resolve(value);
	}
</script>

{#if x || visible}
	<Child {a} {x} {push} />
{/if}

{#if x}
	<span>{await push('gate', x)}</span>
{/if}

<output>{$effect.pending()}</output>
