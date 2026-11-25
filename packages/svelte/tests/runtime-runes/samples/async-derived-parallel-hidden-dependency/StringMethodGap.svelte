<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const name = 'hello';
	const a = $derived(await load('string-method-gap', 'a', 1));
	const upper = name.toUpperCase();
	checkpoint('string-method-gap');
	const b = $derived(await load('string-method-gap', 'b', 2));
</script>

<output>{a}/{upper}/{b}</output>
