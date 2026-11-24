<script lang="ts">
	import Child from './Child.svelte';

	let n = $state(0);
	let waiting = $state(false);
	let show = $state(false);
	let x = $state(0);
	const gate = Promise.withResolvers<number>();
	const answers = new Map<number, (value: number) => void>();

	function load(value: number) {
		console.log(value);
		return new Promise<number>((resolve) => answers.set(value, resolve));
	}
</script>

<button onclick={() => { n++; waiting = true; }}>start</button>
<button onclick={() => { n++; x = 1; show = true; }}>open</button>
<button onclick={() => { n++; x = 2; }}>update</button>
<button onclick={() => { n++; show = false; }}>hide</button>
<button onclick={() => { n++; show = true; }}>reveal</button>
<button onclick={() => answers.get(2)!(2)}>resolve</button>
<button onclick={() => gate.resolve(1)}>finish</button>

<output>
	<p>{n}</p><p>{waiting ? await gate.promise : 0}</p>
	{#if n && show}<Child {x} {load} />{/if}
</output>
