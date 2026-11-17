<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(0);
	let f: Fork;
	let failed = false;
	const gate = Promise.withResolvers<number>();
	const answers = new Map<number, (value: number) => void>();

	function load(value: number, signal: AbortSignal) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		answers.set(value, d.resolve);
		signal.addEventListener('abort', () => d.reject(signal.reason));
		return d.promise;
	}

	function check(value: number) {
		if (!failed) {
			failed = true;
			throw new Error('boom');
		}
		return value;
	}
</script>

<button onclick={() => (x = 1)}>update</button>
<button onclick={() => (f = fork(() => (x = 2)))}>fork</button>
<button onclick={() => answers.get(2)?.(2)}>resolve fork</button>
<button onclick={() => gate.resolve(1)}>fail creator</button>
<button onclick={() => f.commit()}>commit fork</button>

<output>
	<svelte:boundary>
		<Child {x} {load} />
		{#if check(await gate.promise)}<i>ready</i>{/if}
		{#snippet pending()}<p>pending</p>{/snippet}
	</svelte:boundary>
</output>
