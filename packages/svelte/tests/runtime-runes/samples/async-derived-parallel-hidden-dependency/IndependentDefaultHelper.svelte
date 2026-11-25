<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const options = { id: 42 };

	function readOptions(value = options) {
		return value;
	}

	const a = $derived(await load('default-helper', 'a', 1));
	checkpoint('default-helper');
	const b = $derived(await load('default-helper', 'b', readOptions().id));
</script>

<output>{a}/{b}</output>
