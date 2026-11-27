<script lang="ts">
	import { checkpoint, load, loadWithCompletion } from './ReadSchedulingHelpers.js';

	const options = { id: 0 };
	const a = $derived(await loadWithCompletion('property-write', 'a', 1));
	options.id = 42;
	checkpoint('property-write');
	const b = $derived(await load('property-write', 'b', options.id));
</script>

<output>{a}/{b}</output>
