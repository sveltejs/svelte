<script lang="ts">
	import { fork, type Fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f: Fork;
	const pending = new Map<string, () => void>();

	function load(x: number, y: number) {
		const label = `${x}/${y}`;
		console.log(label);
		if (label === '0/0') return label;

		const d = Promise.withResolvers<string>();
		pending.set(label, () => d.resolve(label));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => (y = 1)}>update</button>
<button onclick={() => pending.get('0/1')!()}>resolve real</button>

<output><p>{await load(x, y)}</p></output>
