<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const a = $derived(await load('loop-gap', 'a', 1));

	let total = 0;
	for (const n of [1, 2, 3]) total += n;
	checkpoint('loop-gap');

	const b = $derived(await load('loop-gap', 'b', 2));
</script>

<output>{a}/{total}/{b}</output>
