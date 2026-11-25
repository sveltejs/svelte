<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const options = { id: 42 };

	// we can't see into `load`, so we have to assume that it mutates `options`, which `b` reads
	const a = await load('opaque-argument-barrier', 'a', options);
	checkpoint('opaque-argument-barrier');
	const b = $derived(await load('opaque-argument-barrier', 'b', options.id));
</script>

<output>{a.id}/{b}</output>
