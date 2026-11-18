<script lang="ts">
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	const pending = new Map<string, () => void>();

	function load(x: number, y: number) {
		const value = `${x}/${y}`;
		console.log(value);
		const d = Promise.withResolvers<string>();
		pending.set(value, () => d.resolve(value));
		return d.promise;
	}
</script>

<button onclick={() => fork(() => (x = 1))}>fork 1</button>
<button onclick={() => fork(() => (x = 2))}>fork 2</button>
<button onclick={() => (y = 1)}>start</button>
<button onclick={() => (x = 3)}>update</button>
<button onclick={() => pending.get('3/1')!()}>resolve</button>

<output>
	<i>{x}</i>
	{#if y}<p>{await load(x, y)}</p>{/if}
</output>
