<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork;
	const failure = new Error('private failure');
	const requests: Array<{ input: number; resolve: (value: number) => void; reject: (error: unknown) => void }> = [];

	function load(value: number) {
		console.log(`load ${value}`);
		return new Promise<number>((resolve, reject) => requests.push({ input: value, resolve, reject }));
	}
	function settle(value: number, reject = false) {
		const index = requests.findIndex((request) => request.input === value);
		if (index === -1) return;
		const request = requests.splice(index, 1)[0];
		if (reject) request.reject(failure);
		else request.resolve(value);
	}
</script>

<button onclick={() => (speculative = fork(() => { show = true; input = 1; }))}>fork</button>
<button onclick={() => (revealed = true)}>real</button>
<button onclick={() => settle(1, true)}>reject fork</button>
<button onclick={() => settle(0)}>resolve real</button>
<button onclick={() => speculative.commit().catch((e) => console.log(e === failure ? 'unhandled original' : 'unexpected'))}>commit</button>
<output>
	<svelte:boundary onerror={(e) => console.log(e === failure ? 'handled original' : 'unexpected')}>
		{#if show || revealed}<Child {input} {load} />{/if}
		{#snippet failed(error)}<p>{error === failure ? 'private failure' : 'unexpected'}</p>{/snippet}
	</svelte:boundary>
</output>
