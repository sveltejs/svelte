<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	function twice(n: number) {
		return n * 2;
	}

	const a = $derived(await load('primitive-parameter-gap', 'a', 1));
	const doubled = twice(21);
	checkpoint('primitive-parameter-gap');
	const b = $derived(await load('primitive-parameter-gap', 'b', 2));
</script>

<output>{a}/{doubled}/{b}</output>
