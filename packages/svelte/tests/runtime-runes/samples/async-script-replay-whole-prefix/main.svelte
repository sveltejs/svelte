<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let show = $state(false);
	let revealed = $state(false);
	let input = $state(2);
	let speculative: Fork;
	const requests: Array<{ input: number; resolve: (value: number) => void }> = [];
	function load(value: number) {
		console.log(`load ${value}`);
		return new Promise<number>((resolve) => requests.push({ input: value, resolve }));
	}
	function resolve(value: number) {
		const index = requests.findIndex((request) => request.input === value);
		if (index === -1) throw new Error(`missing request ${value}`);
		requests.splice(index, 1)[0].resolve(value);
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork</button>
<button onclick={() => revealed = true}>real</button>
<button onclick={() => resolve(2)}>resolve real</button>
<button onclick={() => resolve(1)}>resolve fork</button>
<button onclick={() => speculative.commit()}>commit</button>
<button onclick={() => input = 3}>update</button>
<button onclick={() => resolve(3)}>resolve update</button>
<output>{#if show || revealed}<Child {input} {load} />{/if}</output>
