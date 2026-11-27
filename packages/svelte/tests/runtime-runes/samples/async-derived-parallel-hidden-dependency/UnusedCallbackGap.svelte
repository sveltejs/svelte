<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const x = 42;

	function twice(n: number, unused: () => number) {
		return n * 2;
	}

	function readX() {
		return x;
	}

	const a = $derived(await load('unused-callback-gap', 'a', 1));
	const doubled = twice(21, readX);
	checkpoint('unused-callback-gap');
	const b = $derived(await load('unused-callback-gap', 'b', x));
</script>

<output>{a}/{doubled}/{b}</output>
