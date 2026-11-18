<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(0);
	let value = $state.raw(Promise.resolve('one'));
	const answers = new Map<number, (n: number) => void>();

	function slow(n: number, signal: AbortSignal) {
		console.log(n);

		return new Promise<number>((resolve, reject) => {
			answers.set(n, resolve);
			signal.addEventListener('abort', () => {
				console.log(`aborted ${n}`);
				reject(signal.reason);
			});
		});
	}

	function resolve() {
		for (const [n, fn] of answers) fn(n);
	}
</script>

<button onclick={() => count++}>bump</button>
<button onclick={resolve}>resolve</button>

<!-- Keep the controls available while the child's first render is pending. -->
<output>
	<svelte:boundary>
		<Child {count} {value} {slow} />
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</output>
