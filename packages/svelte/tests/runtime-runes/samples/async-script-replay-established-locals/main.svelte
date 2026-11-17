<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork;
	const requests: Array<{ site: string; value: number; resolve: (value: number) => void }> = [];
	function load(site: string, value: number) {
		console.log(`${site} ${value}`);
		return new Promise<number>((resolve) => requests.push({ site, value, resolve }));
	}
	function resolve(site: string, value: number) {
		const index = requests.findIndex((r) => r.site === site && r.value === value);
		if (index !== -1) requests.splice(index, 1)[0].resolve(value);
	}
</script>

<button onclick={() => (speculative = fork(() => { show = true; input = 1; }))}>fork</button>
<button onclick={() => (revealed = true)}>real</button>
<button onclick={() => resolve('a', 0)}>a real</button>
<button onclick={() => resolve('b', 0)}>b real</button>
<button onclick={() => resolve('a', 1)}>a fork</button>
<button onclick={() => resolve('b', 2)}>b fork</button>
<button onclick={() => speculative.commit()}>commit</button>
<button onclick={() => resolve('b', 1)}>b adopted</button>
<button onclick={() => input = 2}>update</button>
<button onclick={() => resolve('a', 2)}>a update</button>
<button onclick={() => resolve('b', 2)}>b update</button>
<output>{#if show || revealed}<Child {input} {load} />{/if}</output>
