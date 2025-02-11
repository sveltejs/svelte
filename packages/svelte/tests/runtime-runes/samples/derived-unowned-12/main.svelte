<script>
	import { untrack } from 'svelte';

	let count = $state(0);
	let state = $state({current: count});

	let linked = $derived.by(() => {
		count;

		untrack(() => state.current = count);
		return untrack(() => state);
	});

	linked.current++;
</script>

<button onclick={() => linked.current++}>linked.current</button> {linked.current}
<button onclick={() => count++}>count</button> {count}
