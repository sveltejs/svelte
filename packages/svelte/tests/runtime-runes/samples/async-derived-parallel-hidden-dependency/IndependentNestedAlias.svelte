<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const nested = { id: 42 };
	const options = { nested };
	const alias = options;
	const a = $derived(await load('nested-alias', 'a', 1));
	checkpoint('nested-alias');
	const b = $derived(await load('nested-alias', 'b', alias.nested.id));
</script>

<output>{a}/{b}</output>
