<script lang="ts">
	import Child from './Child.svelte';
	let increment: () => void;
	const requests: Array<{ input: number; resolve: (value: number) => void }> = [];
	function register(fn: () => void) { increment = fn; }
	function load(value: number) {
		console.log(`load ${value}`);
		return new Promise<number>((resolve) => requests.push({ input: value, resolve }));
	}
	function resolve(value: number) {
		const matches = requests.filter((request) => request.input === value);
		if (matches.length !== 1) throw new Error(`expected one request ${value}, got ${matches.length}`);
		matches[0].resolve(value);
	}
</script>
<button onclick={() => increment()}>external state write</button>
<button onclick={() => resolve(1)}>resolve new</button>
<button onclick={() => resolve(0)}>resolve old</button>
<output>
	<svelte:boundary>
		<Child {register} {load} />
		{#snippet pending()}pending{/snippet}
	</svelte:boundary>
</output>
