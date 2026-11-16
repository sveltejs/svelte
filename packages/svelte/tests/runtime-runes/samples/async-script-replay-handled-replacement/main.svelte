<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	import Waiting from './Waiting.svelte';
	let show = $state(false);
	let input = $state(0);
	let speculative: Fork;
	const failure = new Error('replace me');
	const requests: Array<{ input: number; resolve: (value: number) => void; reject: (error: unknown) => void }> = [];
	let finish: () => void;
	function load(value: number) {
		console.log(`load ${value}`);
		return new Promise<number>((resolve, reject) => requests.push({ input: value, resolve, reject }));
	}
	function wait() {
		console.log('wait');
		return new Promise<string>((resolve) => { finish = () => resolve('ready'); });
	}
	function settle(value: number, reject = false) {
		const index = requests.findIndex((r) => r.input === value);
		if (index === -1) return;
		const request = requests.splice(index, 1)[0];
		if (reject) request.reject(failure);
		else request.resolve(value);
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork</button>
<button onclick={() => settle(1, true)}>reject</button>
<button onclick={() => speculative.commit().then(() => console.log('committed'), () => console.log('unexpected rejection'))}>commit</button>
<button onclick={() => input = 2}>supersede</button>
<button onclick={() => settle(2)}>resolve replacement</button>
<button onclick={() => finish()}>finish sibling</button>
<output>
	<svelte:boundary onerror={() => console.log('stale error')}>
		{#if show}<Child {input} {load} />{/if}
		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
	{#if show}<Waiting {wait} />{/if}
</output>
