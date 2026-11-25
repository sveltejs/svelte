<script lang="ts">
	import { checkpoint, load, loadWithCompletion } from './ReadSchedulingHelpers.js';

	const a = $derived(await loadWithCompletion('dependent-options', 'a', 42));
	const options = { id: a };
	checkpoint('dependent-options');
	const b = $derived(await load('dependent-options', 'b', options.id));
</script>

<output>{a}/{b}</output>
