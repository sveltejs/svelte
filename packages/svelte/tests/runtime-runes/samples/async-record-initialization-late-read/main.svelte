<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(0);
	let suffix = $state('a');
	const begin = Promise.withResolvers<string>();
	const queue: Array<() => void> = [];

	function slow(value: number) {
		console.log(`slow ${value}`);
		return new Promise<number>((resolve) => queue.push(() => resolve(value)));
	}
</script>

<button onclick={() => begin.resolve('ready')}>begin</button>
<button onclick={() => (suffix += '!')}>suffix</button>
<button onclick={() => count++}>count</button>
<button onclick={() => queue.shift()?.()}>resolve</button>

<output>
	<svelte:boundary>
		<Child begin={begin.promise} {count} {suffix} {slow} />
		{#snippet pending()}<p>pending</p>{/snippet}
	</svelte:boundary>
</output>
