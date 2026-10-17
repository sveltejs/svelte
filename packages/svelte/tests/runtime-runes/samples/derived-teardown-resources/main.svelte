<script>
	import { getAbortSignal } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	let count = $state(0);
	let trigger = $state(0);
	let visible = $state(true);
	let subscriptions = 0;
	const signals = [];
	const cleanup = [];
	const failures = new Set();

	const subscribe = createSubscriber(() => {
		subscriptions += 1;
		return () => subscriptions -= 1;
	});

	const value = $derived.by(() => {
		const current = count;
		subscribe();
		const signal = getAbortSignal();
		signals.push({ value: current, signal });
		if (failures.has(current)) throw new Error('historical error');
		return current;
	});

	$effect(() => {
		trigger;
		return () => {
			try {
				cleanup.push(value);
			} catch (error) {
				cleanup.push(error.message.split('\n')[0]);
			}
		};
	});

	export function snapshot() {
		return {
			signals: signals.map(({ value, signal }) => ({ value, aborted: signal.aborted })),
			cleanup: [...cleanup],
			subscriptions
		};
	}
</script>

<button onclick={() => { count += 1; trigger += 1; }}>increment</button>
<button onclick={() => { failures.add(count); count += 1; trigger += 1; }}>error</button>
<button onclick={() => visible = !visible}>toggle</button>
{#if visible}<p>{value}</p>{/if}
