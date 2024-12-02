<script>
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	let map = new SvelteMap();
	let set = new SvelteSet();

	$inspect(map);
	$inspect(set);
</script>

<button onclick={() => map.set('a', 'a')}>Map</button>
<button onclick={() => set.add('a')}>Set</button>
