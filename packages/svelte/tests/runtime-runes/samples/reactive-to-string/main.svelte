<script>
	import { Set as ReactiveSet, Map as ReactiveMap } from 'svelte/reactivity';

	let map = new Map();
	let set = new Set();
	let rmap = new ReactiveMap();
	let rset = new ReactiveSet();
</script>

<div>{rset.entries()} {rset.keys()} {rset.values()}</div>
<div>{set.entries()} {set.keys()} {set.values()}</div>
<div>{rmap.entries()} {rmap.keys()} {rmap.values()}</div>
<div>{map.entries()} {map.keys()} {map.values()}</div>