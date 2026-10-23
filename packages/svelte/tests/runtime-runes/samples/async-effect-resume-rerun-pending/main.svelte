<script>
	import { fade } from 'svelte/transition';
	import Child from './Child.svelte';

	let x = $state(0);
	let s = $state(0);
	let show = $state(true);
	const big = $derived(s > 100);

	const queued = [];

	function push(v) {
		if (v === 0) return v;
		return new Promise((resolve) => queued.push(() => resolve(v)));
	}
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => s++}>s</button>
<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => (s = 1000)}>big</button>

<p>{await push(x)}</p>

{#if show}
	<div transition:fade={{ duration: 100 }}>
		<Child {big} />
	</div>
{/if}
