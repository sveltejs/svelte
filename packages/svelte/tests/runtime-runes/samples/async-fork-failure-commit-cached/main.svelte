<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let revealed = $state(false);
	let x = $state(0);
	let speculative: Fork | undefined;
	const failure = new Error('fork failed');
	const requests: Array<{ value: number; resolve: () => void; reject: () => void }> = [];

	function load(value: number) {
		console.log(`load ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({
			value,
			resolve: () => deferred.resolve(value),
			reject: () => deferred.reject(failure)
		});
		return deferred.promise;
	}

	function settle(value: number, reject = false) {
		const index = requests.findIndex((request) => request.value === value);
		if (index === -1) return;
		const [request] = requests.splice(index, 1);
		if (reject) request.reject();
		else request.resolve();
	}
</script>

<button onclick={() => (speculative = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (revealed = true)}>real</button>
<button onclick={() => settle(1, true)}>reject fork</button>
<button onclick={() => settle(0)}>resolve real</button>
<button onclick={() => speculative?.commit()}>commit</button>

<output>
	<svelte:boundary onerror={(error) => console.log(error === failure ? 'onerror: original' : 'onerror: unexpected')}>
		{#if show || revealed}
			<Child {x} {load} />
		{/if}

		{#snippet failed(error)}
			<p>failed: {error === failure ? 'fork failed' : 'unexpected error'}</p>
		{/snippet}
	</svelte:boundary>
</output>
