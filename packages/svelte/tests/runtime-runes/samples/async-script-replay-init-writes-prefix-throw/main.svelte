<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork;
	let caught = 0;
	let loaded = false;
	const failure = new Error('prefix failed before first await');
	const request = Promise.withResolvers<number>();
	const parked = new Promise<number>(() => {});

	function load(value: number) {
		console.log(`load ${value}`);
		if (value !== 0 || loaded) return parked;
		loaded = true;
		return request.promise;
	}

	async function commit() {
		try {
			await speculative.commit();
			console.log('unexpected commit success');
		} catch (error) {
			caught += 1;
			console.log(error === failure ? `caught original ${caught}` : `caught unexpected ${caught}`);
		}
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork input 1</button>
<button onclick={() => revealed = true}>real input 0</button>
<button onclick={() => request.resolve(0)}>resolve real</button>
<button onclick={commit}>commit fork</button>

<output>
	{#if show || revealed}
		<Child {input} {load} {failure} />
	{/if}
</output>
