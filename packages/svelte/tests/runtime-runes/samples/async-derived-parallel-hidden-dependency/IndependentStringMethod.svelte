<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const text = 'hello';
	const a = $derived(await load('string-method', 'a', 1));
	checkpoint('string-method');
	// The method is part of the candidate, not an ordinary statement crossed by it.
	const b = $derived(await load('string-method', 'b', text.toUpperCase()));
</script>

<output>{a}/{b}</output>
