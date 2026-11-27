<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const options = { id: 42 };
	const a = $derived(await load('property-read', 'a', 1));
	checkpoint('property-read');
	const b = $derived(await load('property-read', 'b', options.id));
</script>

<output>{a}/{b}</output>
