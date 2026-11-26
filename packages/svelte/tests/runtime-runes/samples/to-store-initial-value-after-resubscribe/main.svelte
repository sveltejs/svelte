<script lang="ts">
	import { get, toStore } from 'svelte/store';

	let count = $state(0);
	let read = $state<number>();

	const store = toStore(
		() => count,
		(v) => (count = v)
	);
</script>

<button onclick={() => (read = get(store))}>read</button>
<button onclick={() => (count = 1)}>one</button>
<button onclick={() => (count = 0)}>zero</button>

<output>{read}</output>
