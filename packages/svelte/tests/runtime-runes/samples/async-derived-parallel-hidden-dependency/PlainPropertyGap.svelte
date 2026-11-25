<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const options = { id: 42 };
	const a = $derived(await load('plain-property-gap', 'a', 1));
	const id = options.id;
	checkpoint('plain-property-gap');
	const b = $derived(await load('plain-property-gap', 'b', 2));
</script>

<output>{a}/{id}/{b}</output>
