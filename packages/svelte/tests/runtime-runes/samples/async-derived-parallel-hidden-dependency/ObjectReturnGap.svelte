<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	function makeOptions() {
		return { id: 42 };
	}

	const a = $derived(await load('object-return-gap', 'a', 1));
	const options = makeOptions();
	checkpoint('object-return-gap');
	const b = $derived(await load('object-return-gap', 'b', 2));
</script>

<output>{a}/{options.id}/{b}</output>
