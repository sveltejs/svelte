<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let show = $state(true);

	const registry = [];
	let f;

	function load(value) {
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}
</script>

<button
	onclick={() =>
		(f = fork(() => {
			b = 1;
			show = false;
		}))}>fork</button
>
<button onclick={() => registry.shift()?.()}>resolve</button>
<button
	onclick={() => {
		// the fork's promise resolves (and the fork is flushed) before the real batch is
		registry.shift()?.();
		a += 1;
	}}>resolve and write</button
>
<button onclick={() => f.discard()}>discard</button>

<span>{a}</span>
{#if show}<em>{a}</em>{/if}
{#await load(b) then v}<q>{v}</q>{/await}
