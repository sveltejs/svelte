<script lang="ts">
	import Child from './Child.svelte';

	let show = $state(false);
	let other = $state(false);
	let x = $state(0);
	const answers = new Map<number, (value: number) => void>();

	function load(value: number, signal: AbortSignal) {
		console.log(`load ${value}`);

		return new Promise<number>((resolve, reject) => {
			answers.set(value, resolve);
			signal.addEventListener('abort', () => {
				console.log(`aborted ${value}`);
				reject(signal.reason);
			});
		});
	}
</script>

<button onclick={() => { show = true; x = 1; }}>show</button>
<button onclick={() => { other = true; x = 2; }}>update</button>
<button onclick={() => answers.get(2)?.(2)}>resolve second</button>

<output>
	{#if other || show}
		<Child {x} {load} />
	{/if}
</output>
