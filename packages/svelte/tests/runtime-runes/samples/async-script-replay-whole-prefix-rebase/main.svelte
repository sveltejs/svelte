<script lang="ts">
	import Child from './Child.svelte';
	let show = $state(false);
	let input = $state(1);
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
<button onclick={() => show = true}>show</button>
<button onclick={() => input = 2}>external update</button>
<button onclick={() => resolve(2)}>resolve new</button>
<button onclick={() => resolve(1)}>resolve old</button>
<output>{#if show}<Child {input} {load} />{/if}</output>
