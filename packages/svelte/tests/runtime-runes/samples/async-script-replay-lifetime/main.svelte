<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork;
	const requests: Array<{ value: number; resolve: (value: number) => void }> = [];
	function load(value: number) {
		return new Promise<number>((resolve) => requests.push({ value, resolve }));
	}
	function resolve(value: number) {
		const index = requests.findIndex((r) => r.value === value);
		if (index !== -1) requests.splice(index, 1)[0].resolve(value);
	}
</script>
<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork</button>
<button onclick={() => revealed = true}>real</button>
<button onclick={() => resolve(1)}>resolve fork</button>
<button onclick={() => resolve(0)}>resolve real</button>
<button onclick={() => speculative.commit()}>commit</button>
<button onclick={() => input = 2}>update</button>
<button onclick={() => resolve(2)}>resolve update</button>
<button onclick={() => { show = false; revealed = false; }}>hide</button>
<output>{#if show || revealed}<Child {input} {load} />{/if}</output>
