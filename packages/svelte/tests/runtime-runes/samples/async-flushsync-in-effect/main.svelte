<script lang="ts">
	import { flushSync } from 'svelte';

	let count = $state(0);

	const queue: Array<() => void> = [];

	$effect(() => {
		if (count === 1) {
			count = 2;
			flushSync();
		}
	})

	function push(v: number) {
		if (v === 0) return v;
		return new Promise(r => queue.push(() => r(v)));
	}
</script>

<button onclick={() => count += 1}>
	clicks: {count}
</button>
<button onclick={() => queue.shift()?.()}>shift</button>
{await push(count)}
