<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let count = $state(0);
	let gate = $state(1);
	let f;

	const deferred = [];

	function load(value) {
		console.log(value);
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => (f = fork(() => (show = true)))}>preload</button>
<button onclick={() => count++}>increment</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => gate++}>merge</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>

{#if show && gate > 0}
	<p>{await load(count)}</p>
{/if}
