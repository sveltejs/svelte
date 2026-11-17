<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork;
	const failure = new Error('private b failure');
	const requests: Array<{ site: string; value: number; resolve: (value: number) => void; reject: (error: unknown) => void }> = [];
	function load(site: string, value: number) {
		console.log(`${site} ${value}`);
		return new Promise<number>((resolve, reject) => requests.push({ site, value, resolve, reject }));
	}
	function settle(site: string, value: number, reject = false) {
		const index = requests.findIndex((r) => r.site === site && r.value === value);
		if (index === -1) return;
		const request = requests.splice(index, 1)[0];
		if (reject) request.reject(failure);
		else request.resolve(value);
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork</button>
<button onclick={() => settle('a', 1)}>a fork</button>
<button onclick={() => settle('b', 2, true)}>reject b fork</button>
<button onclick={() => revealed = true}>real</button>
<button onclick={() => settle('a', 0)}>a real</button>
<button onclick={() => settle('b', 0)}>b real</button>
<button onclick={() => speculative.commit().then(() => console.log('unexpected success'), (e) => console.log(e === failure ? 'caught original' : 'unexpected rejection'))}>commit</button>
<output>{#if show || revealed}<Child {input} {load} />{/if}</output>
